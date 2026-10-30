#!/usr/bin/env python3
"""Frame-rate conform without repeated frames, and repair of a generator's own near-repeat and dropped frames.

  conform_fix.py conform <in.mp4> <out.mp4> [--fps 30] [--crf 14]
      Plays every source frame exactly once at the new rate (24p source -> 30p output = 1.25x speed, 0.8x duration).
      No frame is repeated, blended or invented, so there is no judder and no uneven 5-frame cadence. Audio is dropped
      (generated plates carry none). Checks that output frame count equals input frame count.
      Speeding up changes apparent speed: re-check vehicles against any on-screen speed (16.7 mph became 20.8 shown,
      fine; 26.8 became 33.6, which failed a 0.6 to 1.6x tolerance). Alternative: deliver the whole film at 25p.

  conform_fix.py find-repeats <in.mp4> [--json out.json]
      Lists near-repeat frames: difference to the previous frame under 0.45 x the median of the 6 frames around it,
      or near the grain-only floor (under 1.3 x the clip's 10th percentile and under 0.7 x that median).
      Seedance 2.0 often nearly repeats every 4th frame, or shows a 5, 5, 14 pattern. A frame-for-frame conform
      carries that through as judder, and it gives made clips away in a blind test.

  conform_fix.py fix-repeats <in.mp4> <out.mp4> [--fps SAME] [--crf 12] [--json log.json]
      Replaces each near-repeat with a flow-interpolated midpoint of its neighbours (bidirectional Farneback at half
      resolution) plus fresh grain (sigma 0.85, because averaging two frames lowers grain by about 1/sqrt 2).
      This halves judder; it does not remove it. Midpoints can ghost (a doubled phone was seen), so check every
      replaced frame at 100 % (contact_sheet.py --frames ...).

  conform_fix.py find-skips <in.mp4> [--ratio 1.6] [--json out.json]
      Lists DROPPED frames, the fault a repeat check cannot see: one step where everything that moves jumps about
      twice as far as the steps around it (mean flow of the moving pixels over the median of the 8 neighbouring steps
      at or over --ratio) while cells that are still for the whole clip do not move (so camera shake is not counted).
      Seedance bridge-1 dropped one source frame a second (2x steps at 24, 48 and 72) and passed find-repeats.

  conform_fix.py fix-skips <in.mp4> <out.mp4> [--ratio 1.6] [--crf 12] [--json log.json]
      Inserts one flow-interpolated midpoint (plus fresh grain) inside each dropped interval, so every step is one
      interval again. The clip gets one frame longer per skip. Check every inserted frame at 100 % for ghosting.
      If the plate must also be retimed (24p shown at true speed in a 30p film needs interpolation, a frame-for-frame
      conform plays it 1.25x), count each skip as two intervals on the source timeline instead, then resample.

Typical order for a generated plate: find-skips and fix-repeats at native 24p (a skip and a repeat need opposite
fixes), then grade, then conform.
Needs ffmpeg/ffprobe; find-repeats and fix-repeats also need numpy and opencv-python.
"""
import argparse
import json
import subprocess
import sys


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-count_frames", "-show_entries",
                          "stream=width,height,r_frame_rate,nb_read_frames", "-of", "json", path],
                         capture_output=True, text=True, check=True).stdout
    s = json.loads(out)["streams"][0]
    n, d = s["r_frame_rate"].split("/")
    return int(s["width"]), int(s["height"]), float(n) / float(d), int(s.get("nb_read_frames", 0))


def conform(a):
    w, h, fps, n = probe(a.input)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.input, "-an", "-vf", f"setpts=N/({a.fps}*TB)",
                    "-fps_mode", "cfr", "-r", str(a.fps), "-c:v", "libx264", "-preset", "slow", "-crf", str(a.crf),
                    "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                    "-movflags", "+faststart", a.output], check=True)
    _, _, fo, no = probe(a.output)
    ok = no == n
    print(json.dumps(dict(input=a.input, in_fps=round(fps, 3), in_frames=n, output=a.output, out_fps=round(fo, 3),
                          out_frames=no, speed=round(a.fps / fps, 4), frames_match=ok)))
    if not ok:
        sys.exit("frame count changed: a frame was dropped or repeated")


def deps():
    try:
        import cv2
        import numpy as np
        return cv2, np
    except ImportError:
        sys.exit("needs numpy and opencv-python (pip install numpy opencv-python)")


def decode(path, np):
    w, h, fps, _ = probe(path)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-fps_mode", "passthrough", "-f", "rawvideo",
                          "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3).copy(), fps


def find_repeats(frames, cv2, np):
    L = np.array([0.2126, 0.7152, 0.0722], np.float32)
    ys = [cv2.resize(f.astype(np.float32) @ L, (f.shape[1] // 2, f.shape[0] // 2), interpolation=cv2.INTER_AREA)
          for f in frames]
    d = np.array([0.0] + [float(np.abs(ys[k] - ys[k - 1]).mean()) for k in range(1, len(ys))])
    p10 = float(np.percentile(d[1:], 10))
    rep = []
    for k in range(1, len(d) - 1):
        nb = float(np.median([d[j] for j in range(max(1, k - 3), min(len(d), k + 4)) if j != k]))
        if d[k] < 0.45 * nb or (d[k] < 1.3 * p10 and d[k] < 0.7 * nb):
            rep.append(k)
    return rep, d


def midpoint(A, B, cv2, np):
    H, W = A.shape[:2]
    L = np.array([0.2126, 0.7152, 0.0722], np.float32)
    ga = cv2.resize(A.astype(np.float32) @ L, (W // 2, H // 2)).astype(np.uint8)
    gb = cv2.resize(B.astype(np.float32) @ L, (W // 2, H // 2)).astype(np.uint8)
    prm = (None, 0.5, 4, 21, 3, 5, 1.1, 0)
    fab = cv2.resize(cv2.calcOpticalFlowFarneback(ga, gb, *prm), (W, H)) * 2.0
    fba = cv2.resize(cv2.calcOpticalFlowFarneback(gb, ga, *prm), (W, H)) * 2.0
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    wa = cv2.remap(A, xx - 0.5 * fab[..., 0], yy - 0.5 * fab[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    wb = cv2.remap(B, xx - 0.5 * fba[..., 0], yy - 0.5 * fba[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    m = 0.5 * wa.astype(np.float32) + 0.5 * wb.astype(np.float32)
    rng = np.random.default_rng(int(A[::97, ::89].sum()) % 100003)
    m += rng.normal(0, 0.85, (H, W, 1)).astype(np.float32)
    return np.clip(m + 0.5, 0, 255).astype(np.uint8)


def find_skips(frames, cv2, np, ratio=1.6):
    """Dropped frames: a 2x motion step against the neighbouring steps, with a still-region guard."""
    H, W = frames.shape[1:3]
    fw = min(W, 320)
    fh = max(2, int(round(H * fw / W / 2) * 2))
    L = np.array([0.2126, 0.7152, 0.0722], np.float32)
    g = [cv2.resize(f.astype(np.float32) @ L, (fw, fh), interpolation=cv2.INTER_AREA).astype(np.uint8) for f in frames]
    mo, cells = [], []
    for k in range(1, len(g)):
        fl = cv2.calcOpticalFlowFarneback(g[k - 1], g[k], None, 0.5, 3, 15, 3, 5, 1.2, 0)
        mag = np.sqrt((fl ** 2).sum(-1))
        v = mag[mag >= max(0.25, float(np.percentile(mag, 90)))]
        mo.append(float(v.mean()) if v.size >= max(20, mag.size // 500) else 0.0)
        cells.append(cv2.resize(mag, (32, 18), interpolation=cv2.INTER_AREA))
    mo = np.array(mo)
    C = np.stack(cells)
    still = (np.median(C, 0) < 0.1) & (np.percentile(C, 90, 0) < 0.3)
    guarded = bool(still.mean() >= 0.05)
    st = np.array([float(c[still].mean()) for c in C]) if guarded else np.zeros(len(mo))
    out = []
    for j in range(len(mo)):
        nb = [mo[i] for i in range(max(0, j - 4), min(len(mo), j + 5)) if i != j]
        if len(nb) < 4 or np.median(nb) < 0.15:
            continue
        r = mo[j] / float(np.median(nb))
        if r >= ratio and r < 4.0 and (not guarded or st[j] <= max(0.08, 3 * float(np.median(st)))):
            out.append(dict(frame=j + 1, ratio=round(float(r), 2)))
    return out, dict(guarded=guarded, still_share=round(float(still.mean()), 3))


def cmd_find_skips(a):
    cv2, np = deps()
    frames, fps = decode(a.input, np)
    sk, info = find_skips(frames, cv2, np, a.ratio)
    res = dict(input=a.input, fps=round(fps, 3), frames=len(frames), skips=sk,
               gaps=np.diff([s["frame"] for s in sk]).tolist() if len(sk) > 1 else [], **info)
    if a.json:
        json.dump(res, open(a.json, "w"), indent=1)
    print(json.dumps(res))


def cmd_fix_skips(a):
    cv2, np = deps()
    frames, fps = decode(a.input, np)
    sk, info = find_skips(frames, cv2, np, a.ratio)
    at = {s["frame"] for s in sk}
    out = []
    for k in range(len(frames)):
        if k in at:
            out.append(midpoint(frames[k - 1], frames[k], cv2, np))
        out.append(frames[k])
    out = np.stack(out)
    h, w = frames.shape[1:3]
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}",
                            "-r", str(fps), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", str(a.crf),
                            "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                            "-movflags", "+faststart", a.output], stdin=subprocess.PIPE)
    enc.stdin.write(np.ascontiguousarray(out).tobytes())
    enc.stdin.close()
    enc.wait()
    sk2, _ = find_skips(out, cv2, np, a.ratio)
    inserted = [s["frame"] + i for i, s in enumerate(sorted(sk, key=lambda s: s["frame"]))]
    res = dict(input=a.input, output=a.output, skips=sk, inserted_at_output_frames=inserted, frames_in=len(frames),
               frames_out=len(out), skips_after=sk2, **info,
               note="check every inserted frame at 100 % for ghosting (contact_sheet.py --frames ...)")
    if a.json:
        json.dump(res, open(a.json, "w"), indent=1)
    print(json.dumps(res))


def cmd_find(a):
    cv2, np = deps()
    frames, fps = decode(a.input, np)
    rep, d = find_repeats(frames, cv2, np)
    gaps = np.diff(rep).tolist() if len(rep) > 1 else []
    res = dict(input=a.input, fps=round(fps, 3), frames=len(frames), near_repeats=rep, gaps=gaps,
               median_diff=round(float(np.median(d[1:])), 3))
    if a.json:
        json.dump(res, open(a.json, "w"), indent=1)
    print(json.dumps(res))


def cmd_fix(a):
    cv2, np = deps()
    frames, fps = decode(a.input, np)
    rep, _ = find_repeats(frames, cv2, np)
    out = frames.copy()
    for k in rep:
        out[k] = midpoint(frames[k - 1], frames[k + 1], cv2, np)
    h, w = frames.shape[1:3]
    rate = a.fps or fps
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}",
                            "-r", str(rate), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", str(a.crf),
                            "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                            "-movflags", "+faststart", a.output], stdin=subprocess.PIPE)
    enc.stdin.write(np.ascontiguousarray(out).tobytes())
    enc.stdin.close()
    enc.wait()
    rep2, _ = find_repeats(out, cv2, np)
    res = dict(input=a.input, output=a.output, replaced=rep, near_repeats_after=rep2,
               note="a midpoint halves the step either side, so the re-check may still flag those half-steps: judder is "
                    "halved, not removed. Check every replaced frame at 100 % for ghosting")
    if a.json:
        json.dump(res, open(a.json, "w"), indent=1)
    print(json.dumps(res))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("conform", help="frame-for-frame retime, no repeats")
    c.add_argument("input")
    c.add_argument("output")
    c.add_argument("--fps", type=float, default=30.0)
    c.add_argument("--crf", type=int, default=14)
    f = sub.add_parser("find-repeats", help="list a clip's near-repeat frames")
    f.add_argument("input")
    f.add_argument("--json")
    x = sub.add_parser("fix-repeats", help="replace near-repeats with flow midpoints")
    x.add_argument("input")
    x.add_argument("output")
    x.add_argument("--fps", type=float, default=None, help="output rate (default: same as input)")
    x.add_argument("--crf", type=int, default=12)
    x.add_argument("--json")
    k = sub.add_parser("find-skips", help="list dropped frames (2x motion steps with a still background)")
    k.add_argument("input")
    k.add_argument("--ratio", type=float, default=1.6)
    k.add_argument("--json")
    y = sub.add_parser("fix-skips", help="insert a flow midpoint inside each dropped interval")
    y.add_argument("input")
    y.add_argument("output")
    y.add_argument("--ratio", type=float, default=1.6)
    y.add_argument("--crf", type=int, default=12)
    y.add_argument("--json")
    a = ap.parse_args()
    {"conform": conform, "find-repeats": cmd_find, "fix-repeats": cmd_fix, "find-skips": cmd_find_skips,
     "fix-skips": cmd_fix_skips}[a.cmd](a)


if __name__ == "__main__":
    main()
