#!/usr/bin/env python3
"""Deliverables: loudness-targeted masters, audio-identical re-muxes, phone review encodes, and a verify report.

  deliver.py master <picture.mp4> <music_or_mix.wav> <out.mp4> [--target send|call|vertical | --lufs -14 --tp -1]
                    [--trim SECONDS] [--fade-out 0.6]
      Picture stream-copied; audio measured (two-pass loudnorm, linear mode so the mix is not pumped), gained to the
      target, true-peak limited, AAC 320k 48 kHz, faststart; then measured again with ebur128 and checked.
      Targets used for the Oct 2026 films:
        send      -14 LUFS integrated, true peak <= -1 dBTP   (social, web, sent files; delivered -14.1 / -1.5)
        call      -24 LUFS, true peak <= -2 dBTP              (played on a call under a presenter's voice; -24.1)
        vertical  -14 LUFS, true peak <= -1 dBTP              (delivered -13.8)
      Make one send and one call master of every film.

  deliver.py mux <new_picture.mp4> <approved_master.mp4> <out.mp4>
      Re-cut picture with the APPROVED master's own audio by stream copy, so loudness and the beat grid are untouched;
      then proves it: decoded-audio MD5 and packet MD5 identical, same duration. (One run's notes said "byte-identical"
      while its own check logged audio_same=NO: report the measured result, not the intention.)

  deliver.py review <master.mp4> <out.mp4> [--max-mb 15] [--height 720] [--kbps auto]
      Phone review copy: 720 px short side at the SOURCE aspect (1280x720, 720x1280, 720x900 for 4:5), two-pass x264 (single pass undershot to about 390 kbps on
      static motion graphics), AAC 96k, faststart. Bitrate chosen to land under --max-mb with headroom, capped at the
      rates that worked: 660 kbps for 16:9 and 1500 kbps for 9:16. Refuses if the result is over --max-mb.
      The reviewer watches on a phone from a review page; keep every review file under 15 MB.

  deliver.py verify <file.mp4> [...]
      Prints frames, fps, duration, size, integrated loudness, true peak and decoded-audio MD5 for each file.

Web encodes (not here): H.264 High CRF 21 capped at 4 Mbit/s plus VP9 two-pass at 1.8 Mbit/s and a poster frame that
explains the film on its own; encode only the approved cut, and refuse anything named like a superseded version.
Needs ffmpeg/ffprobe on PATH. Python standard library only.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile

TARGETS = {"send": (-14.0, -1.0), "call": (-24.0, -2.0), "vertical": (-14.0, -1.0)}


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def probe(path):
    j = json.loads(run(["ffprobe", "-v", "error", "-show_entries",
                        "stream=codec_type,width,height,r_frame_rate,nb_frames:format=duration,size", "-of", "json",
                        path], check=True).stdout)
    v = next((s for s in j["streams"] if s["codec_type"] == "video"), {})
    fr = v.get("r_frame_rate", "0/1").split("/")
    return dict(width=v.get("width"), height=v.get("height"),
                fps=round(float(fr[0]) / float(fr[1]), 3) if float(fr[1]) else None,
                frames=int(v["nb_frames"]) if v.get("nb_frames", "N/A").isdigit() else None,
                duration=float(j["format"]["duration"]), size=int(j["format"]["size"]),
                has_audio=any(s["codec_type"] == "audio" for s in j["streams"]))


def loudness(path):
    err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null",
               "-"]).stderr
    i = re.findall(r"I:\s+(-?[\d.]+) LUFS", err)
    tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", err)
    return (float(i[-1]) if i else None), (float(tp[-1]) if tp else None)


def audio_md5(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-map", "0:a:0", "-f", "s16le", "-ac", "2", "-ar", "48000", "-"],
                       capture_output=True)
    return hashlib.md5(p.stdout).hexdigest() if p.stdout else None


def packet_md5(path):
    out = run(["ffmpeg", "-v", "error", "-i", path, "-map", "0:a:0", "-c", "copy", "-f", "md5", "-"]).stdout.strip()
    return out.replace("MD5=", "") or None


def master(a):
    """Measure the bed, apply one gain, limit true peaks (4x oversampled limiter with 0.5 dB margin), measure the
    result, correct the gain once, verify. This is the method the Oct 2026 masters used (bed measured, then gain and
    limiter), rather than dynamic loudnorm, which pumps music."""
    lufs, tp = (a.lufs, a.tp) if a.lufs is not None else TARGETS[a.target]
    pic = probe(a.picture)
    dur = a.trim or pic["duration"]
    with tempfile.TemporaryDirectory() as td:
        bed = os.path.join(td, "bed.wav")
        r = run(["ffmpeg", "-v", "error", "-y", "-t", f"{dur:.3f}", "-i", a.audio, "-ar", "48000", "-ac", "2", bed])
        if r.returncode:
            sys.exit(r.stderr)
        i0, _ = loudness(bed)
        if i0 is None:
            sys.exit("could not measure the audio")
        limit = 10 ** ((tp - 0.5) / 20)
        gain = lufs - i0

        def render(g):
            af = [f"aresample=192000", f"volume={g:.2f}dB", f"alimiter=limit={limit:.4f}:level=false:attack=5:release=60"]
            if a.fade_out:
                af.append(f"afade=t=out:st={max(0, dur - a.fade_out):.3f}:d={a.fade_out}")
            af.append("aresample=48000")
            r = run(["ffmpeg", "-v", "error", "-y", "-i", a.picture, "-i", bed, "-map", "0:v:0", "-map", "1:a:0",
                     "-c:v", "copy", "-af", ",".join(af), "-c:a", "aac", "-b:a", "320k", "-ar", "48000",
                     "-t", f"{dur:.3f}", "-movflags", "+faststart", a.out])
            if r.returncode:
                sys.exit(r.stderr)
            return loudness(a.out)

        i, p = render(gain)
        if i is not None and abs(i - lufs) > 0.3:
            gain += lufs - i
            i, p = render(gain)
    ok = i is not None and abs(i - lufs) <= 0.5 and p is not None and p <= tp + 0.1
    print(json.dumps(dict(out=a.out, target_lufs=lufs, target_tp=tp, input_lufs=i0, gain_db=round(gain, 2),
                          measured_lufs=i, measured_tp=p,
                          verdict="PASS" if ok else "CHECK (too peaky to reach the target under the ceiling: "
                                                    "use a denser mix or accept a quieter master)")))
    if not ok:
        sys.exit(1)


def mux(a):
    r = run(["ffmpeg", "-v", "error", "-y", "-i", a.picture, "-i", a.approved, "-map", "0:v:0", "-map", "1:a:0", "-c", "copy",
             "-movflags", "+faststart", a.out])
    if r.returncode:
        sys.exit(r.stderr)
    pa, po = probe(a.approved), probe(a.out)
    same_pcm = audio_md5(a.approved) == audio_md5(a.out)
    same_pkt = packet_md5(a.approved) == packet_md5(a.out)
    res = dict(out=a.out, audio_pcm_identical=same_pcm, audio_packets_identical=same_pkt,
               duration_approved=pa["duration"], duration_out=po["duration"],
               duration_match=abs(pa["duration"] - po["duration"]) < 0.05)
    print(json.dumps(res))
    if not (same_pcm and same_pkt and res["duration_match"]):
        sys.exit(1)


def review(a):
    p = probe(a.master)
    portrait = p["height"] > p["width"]
    # --height is the short side; the long side follows the SOURCE aspect (16:9 -> 1280x720, 9:16 -> 720x1280,
    # 4:5 -> 720x900, 1:1 -> 720x720). Fixed 19 Oct 2026: it used to assume 16:9 or 9:16 and stretched a 4:5 master
    # to 720x1280.
    short, longer = min(p["width"], p["height"]), max(p["width"], p["height"])
    long_side = int(round(a.height * longer / short / 2)) * 2
    size = f"{a.height}:{long_side}" if portrait else f"{long_side}:{a.height}"
    audio_k = 96 if p.get("has_audio") else 0
    budget_k = int(a.max_mb * 8 * 1000 * 0.92 / p["duration"]) - audio_k  # 8 % headroom for the container
    cap = 1500 if portrait else 660
    kbps = a.kbps or max(150, min(cap, budget_k))
    with tempfile.TemporaryDirectory() as td:
        log = os.path.join(td, "x264")
        base = ["ffmpeg", "-v", "error", "-y", "-i", a.master, "-vf", f"scale={size}:flags=lanczos", "-c:v", "libx264",
                "-preset", "slow", "-b:v", f"{kbps}k", "-passlogfile", log]
        r1 = run(base + ["-pass", "1", "-an", "-f", "mp4", os.devnull])
        audio = ["-c:a", "aac", "-b:a", f"{audio_k}k"] if audio_k else ["-an"]  # silent masters stay silent
        r2 = run(base + ["-pass", "2", "-pix_fmt", "yuv420p"] + audio + ["-movflags", "+faststart", a.out])
        if r1.returncode or r2.returncode:
            sys.exit(r1.stderr + r2.stderr)
    mb = os.path.getsize(a.out) / 1e6
    print(json.dumps(dict(out=a.out, size=size, video_kbps=kbps, mb=round(mb, 2), limit_mb=a.max_mb)))
    if mb > a.max_mb:
        sys.exit(f"review file is {mb:.1f} MB, over {a.max_mb} MB: pass a lower --kbps")


def verify(a):
    for f in a.files:
        p = probe(f)
        i, tp = loudness(f) if p["has_audio"] else (None, None)
        print(json.dumps(dict(file=f, **p, lufs=i, true_peak_dbfs=tp, audio_md5=audio_md5(f) if p["has_audio"] else None)))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    sub = ap.add_subparsers(dest="cmd", required=True)
    m = sub.add_parser("master")
    m.add_argument("picture")
    m.add_argument("audio")
    m.add_argument("out")
    m.add_argument("--target", choices=sorted(TARGETS), default="send")
    m.add_argument("--lufs", type=float, help="custom integrated loudness target (with --tp)")
    m.add_argument("--tp", type=float, default=-1.0, help="custom true-peak ceiling in dBTP")
    m.add_argument("--trim", type=float, help="master length in seconds (default: picture length)")
    m.add_argument("--fade-out", type=float, default=0.0, help="tail fade in seconds (prefer the track's own ending)")
    x = sub.add_parser("mux")
    x.add_argument("picture")
    x.add_argument("approved")
    x.add_argument("out")
    r = sub.add_parser("review")
    r.add_argument("master")
    r.add_argument("out")
    r.add_argument("--max-mb", type=float, default=15.0)
    r.add_argument("--height", type=int, default=720, help="short side in px; the long side keeps the source aspect (720 gives 1280x720, 720x1280 or 720x900)")
    r.add_argument("--kbps", type=int, help="force a video bitrate")
    v = sub.add_parser("verify")
    v.add_argument("files", nargs="+")
    a = ap.parse_args()
    {"master": master, "mux": mux, "review": review, "verify": verify}[a.cmd](a)


if __name__ == "__main__":
    main()
