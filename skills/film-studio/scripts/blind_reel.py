#!/usr/bin/env python3
"""Blind test: can people tell made (AI) clips from real ones? Seeded reel, sealed key, scorer with a noise band.

  blind_reel.py key   --made m1.mp4 ... --real r1.mov ... --key KEY.csv [--seed 20261020] [--max-run 2]
  blind_reel.py build --made m1.mp4 ... --real r1.mov ... --key KEY.csv --out MADE-mixed-reel.mp4
                      [--seed ...] [--frames 64] [--fps 24] [--size 1280x720] [--slate 1.0] [--grain 1.6]
  blind_reel.py score --key KEY.csv --results results.csv [--margin 15] [--reject-share 0.8]

Design (fixed BEFORE anyone watches; Oct 2026 films):
  - The order comes from the seed, so the key can be written before the real clips even exist; build re-derives the
    order and refuses if it differs from the key. Keep the key in a different folder from the reel, never beside it.
    --max-run stops three of a kind in a row (reshuffles deterministically until it holds).
  - Every clip gets identical treatment so the pipeline is not a tell: same size, fps, frame count, crop-to-fill, a
    gamma that keeps each clip's own mean luma onto one floor/highlight, the same grain, the same encoder, no audio,
    metadata stripped, a numbered slate between clips. Made clips play every frame once at their native rate (24p for
    Seedance), never slowed or looped. Real clips use their middle N frames; 24/25 fps sources go frame for frame,
    anything else is resampled and FLAGGED (a possible tell). Shoot the real half at the same rate as the made half.
  - Clip length = the longest window every made clip keeps after the judges' trims (64 frames = 2.67 s at 24 fps).
  - Real twins: film each real clip to match a made clip's subject, framing, light and aspect.
  - Viewers: people who have never seen the clips, one at a time, sound off, no replay, on the device they would
    really use. Results CSV columns: person,device,clip,answer   (answer REAL or AI, one row per person per clip).
  - PASS if the share of made clips marked AI is no more than the share of real clips marked AI plus --margin points.
    With about 9 people x 10 made clips the noise is about +/- 15 points: inside that band report a draw, not a pass.
    Any made clip marked AI by --reject-share of viewers or more goes back to the forensic lane.
  - The reel file name must contain MADE (it holds generated footage). An internal reel may run unlabelled; tell the
    viewers afterwards.
build needs numpy and opencv-python plus ffmpeg/ffprobe; key and score need only Python.
"""
import argparse
import csv
import json
import math
import os
import random
import subprocess
import sys
from collections import defaultdict


def order(made, real, seed, max_run):
    items = [("MADE", m) for m in made] + [("REAL", r) for r in real]
    for k in range(1000):
        it = list(items)
        random.Random(seed + k).shuffle(it)
        run, ok = 1, True
        for i in range(1, len(it)):
            run = run + 1 if it[i][0] == it[i - 1][0] else 1
            if max_run and run > max_run:
                ok = False
                break
        if ok:
            return it, seed + k
    sys.exit("could not satisfy --max-run with this many clips")


def write_key(path, it, seed_used):
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["clip", "answer", "source", "seed"])
        w.writeheader()
        for i, (k, s) in enumerate(it, 1):
            w.writerow(dict(clip=i, answer=k, source=os.path.basename(s), seed=seed_used))


def cmd_key(a):
    it, used = order(a.made, a.real, a.seed, a.max_run)
    write_key(a.key, it, used)
    print(f"key written: {a.key} ({len(a.made)} made, {len(a.real)} real, seed {used}). Keep it away from the reel.")


def cmd_build(a):
    if "MADE" not in os.path.basename(a.out):
        sys.exit("reel name must contain MADE (it holds generated footage)")
    if os.path.abspath(os.path.dirname(a.key)) == os.path.abspath(os.path.dirname(a.out) or "."):
        sys.exit("the key must not sit in the same folder as the reel")
    try:
        import cv2
        import numpy as np
    except ImportError:
        sys.exit("build needs numpy and opencv-python")
    W, H = (int(v) for v in a.size.lower().split("x"))
    N, FPS = a.frames, a.fps
    it, used = order(a.made, a.real, a.seed, a.max_run)
    if os.path.exists(a.key):
        old = [(r["answer"], r["source"]) for r in csv.DictReader(open(a.key))]
        if old != [(k, os.path.basename(s)) for k, s in it]:
            sys.exit("the seeded order does not match the existing key: same clips, same order, same seed please")
    else:
        write_key(a.key, it, used)
    L = np.array([0.2126, 0.7152, 0.0722], np.float32)

    def probe(p):
        j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries",
                                       "stream=r_frame_rate,width,height:format=duration", "-of", "json", p],
                                      capture_output=True, text=True, check=True).stdout)
        n_, d_ = j["streams"][0]["r_frame_rate"].split("/")
        return float(n_) / float(d_), float(j["format"]["duration"]), j["streams"][0]["width"], j["streams"][0]["height"]

    def frames_of(p, kind):
        fps, dur, w, h = probe(p)
        native = abs(fps - FPS) < 1.6
        ss = 0.0 if kind == "MADE" else max(0.0, dur / 2 - N / FPS / 2)
        vf = f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H}"
        if not native:
            vf = f"fps={FPS}," + vf
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{ss:.3f}", "-i", p, "-vf", vf, "-frames:v", str(N),
                              "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                             capture_output=True, check=True).stdout
        fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
        if len(fr) < N:
            sys.exit(f"{p}: only {len(fr)} frames, needs {N}")
        return fr[:N], dict(src_fps=round(fps, 3), resampled=not native, portrait=h > w)

    floor, hi = np.array([6, 6, 8], np.float32), np.array([246, 246, 244], np.float32)

    def treat(fr, seed):
        arr = fr.astype(np.float32) / 255.0
        own = float((arr[::4, ::8, ::8] * 255 * L).sum(-1).mean())
        lo_g, hi_g = 0.2, 5.0
        for _ in range(40):
            g = (lo_g + hi_g) / 2
            m = float(((floor + (hi - floor) * np.power(arr[::4, ::8, ::8], g)) * L).sum(-1).mean())
            lo_g, hi_g = (g, hi_g) if m > own else (lo_g, g)
        rng = np.random.default_rng(seed)
        return [np.clip(floor + (hi - floor) * np.power(f, g) + rng.normal(0, a.grain, (H, W, 1)) + 0.5, 0, 255)
                .astype(np.uint8) for f in arr]

    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt",
                            "yuv420p", "-map_metadata", "-1", "-movflags", "+faststart", a.out], stdin=subprocess.PIPE)
    log, t = [], 0.0
    for i, (kind, src) in enumerate(it, 1):
        sl = np.zeros((H, W, 3), np.uint8)
        sl[:] = (11, 18, 32)
        txt = f"Clip {i}"
        sc = H / 360
        (tw, th), _ = cv2.getTextSize(txt, cv2.FONT_HERSHEY_SIMPLEX, sc, max(1, int(2 * sc)))
        cv2.putText(sl, txt, ((W - tw) // 2, (H + th) // 2), cv2.FONT_HERSHEY_SIMPLEX, sc, (235, 235, 235),
                    max(1, int(2 * sc)), cv2.LINE_AA)
        for _ in range(int(round(a.slate * FPS))):
            enc.stdin.write(sl.tobytes())
        t += a.slate
        fr, info = frames_of(src, kind)
        for f in treat(fr, used + i):
            enc.stdin.write(f.tobytes())
        log.append(dict(clip=i, answer=kind, source=os.path.basename(src), starts_at_s=round(t, 2), **info))
        t += N / FPS
    enc.stdin.close()
    enc.wait()
    flagged = [x["source"] for x in log if x["resampled"] or x["portrait"]]
    side = os.path.splitext(a.key)[0] + "-build.json"
    json.dump(dict(reel=a.out, seed=used, clip_s=round(N / FPS, 3), clips=log), open(side, "w"), indent=1)
    print(f"reel: {a.out} ({t:.1f} s, {len(log)} clips); build log beside the key: {side}")
    if flagged:
        print("WARNING: resampled or portrait sources (could be a tell):", flagged)


def cmd_score(a):
    key = {int(r["clip"]): r for r in csv.DictReader(open(a.key))}
    rows = list(csv.DictReader(open(a.results)))
    for device in sorted({r.get("device", "all") for r in rows}):
        rs = [r for r in rows if r.get("device", "all") == device]
        made = [r["answer"].strip().upper() == "AI" for r in rs if key[int(r["clip"])]["answer"] == "MADE"]
        real = [r["answer"].strip().upper() == "AI" for r in rs if key[int(r["clip"])]["answer"] == "REAL"]
        if not made or not real:
            print(f"[{device}] needs answers on both made and real clips")
            continue
        pm, pr = 100 * sum(made) / len(made), 100 * sum(real) / len(real)
        gap = pm - pr
        se = 100 * math.sqrt((pm / 100) * (1 - pm / 100) / len(made) + (pr / 100) * (1 - pr / 100) / len(real))
        verdict = "PASS" if gap <= a.margin else "FAIL"
        if abs(gap - a.margin) < 1.96 * se:
            verdict = "DRAW (within noise of the line)"
        print(f"[{device}] {len({r['person'] for r in rs})} people. Made marked AI {pm:.0f} % ({len(made)} answers); "
              f"real marked AI {pr:.0f} % ({len(real)}). Gap {gap:+.0f} points against +{a.margin:g}: {verdict}. "
              f"Rough 95 % band +/- {1.96 * se:.0f} points (plain binomial).")
        caught = defaultdict(list)
        for r in rs:
            k = key[int(r["clip"])]
            if k["answer"] == "MADE":
                caught[k["source"]].append(r["answer"].strip().upper() == "AI")
        for src, v in sorted(caught.items(), key=lambda kv: -sum(kv[1]) / len(kv[1])):
            share = sum(v) / len(v)
            flag = "  <- REJECT, back to forensics" if share >= a.reject_share else ""
            print(f"    {src}: {100 * share:.0f} % marked AI{flag}")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("key", "build"):
        p = sub.add_parser(name)
        p.add_argument("--made", nargs="+", required=True)
        p.add_argument("--real", nargs="+", required=True)
        p.add_argument("--key", required=True)
        p.add_argument("--seed", type=int, default=20261020)
        p.add_argument("--max-run", type=int, default=2)
        if name == "build":
            p.add_argument("--out", required=True)
            p.add_argument("--frames", type=int, default=64)
            p.add_argument("--fps", type=float, default=24.0)
            p.add_argument("--size", default="1280x720")
            p.add_argument("--slate", type=float, default=1.0)
            p.add_argument("--grain", type=float, default=1.6)
    s = sub.add_parser("score")
    s.add_argument("--key", required=True)
    s.add_argument("--results", required=True)
    s.add_argument("--margin", type=float, default=15.0)
    s.add_argument("--reject-share", type=float, default=0.8)
    a = ap.parse_args()
    {"key": cmd_key, "build": cmd_build, "score": cmd_score}[a.cmd](a)


if __name__ == "__main__":
    main()
