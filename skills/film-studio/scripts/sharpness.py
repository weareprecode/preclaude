#!/usr/bin/env python3
"""Sharpness gate for captures: the variance of the 4-neighbour Laplacian of BT.601 luma inside a box.

Why: a streamed 3D page (photoreal mesh, 3D tiles, splats) can be captured before it has refined, and the take then
looks soft on a big screen although every frame "loaded". In Oct 2026 a rig fault left a whole film at 29.8 on a roof-
sign crop where the plain page measured 116; nobody saw it at review size. Measure, never eyeball. film_rig.mjs uses the
same measure for its pre-capture gate, so readings are comparable.

Usage:
  sharpness.py still <image-or-video>... [--box x0 y0 x1 y1] [--frame N] [--min 90] [--json out.json]
  sharpness.py scan <video | frames_dir> [--box x0 y0 x1 y1] [--first 0] [--last N] [--scale 0.5]
                    [--window 6] [--dip 0.85] [--min 0] [--json out.json]

still  one reading per image (PNG/JPG) or per video frame (--frame N, default 0). With --min, exit 1 if any reading
       is below it. Use it on gate stills, on spot frames of a take, and on a plain-page reference.
scan   every frame (of a video, or f00000.png ... in a frames folder) at --scale (default 0.5; readings at other
       scales are not comparable), then the DIPS: frames whose sharpness is under --dip (default 0.85) times the
       median of the --window (default 6) frames either side. A dip is a frame that softened while its neighbours did
       not: a detail level dropping during a move, a re-texture, a one-frame blur. Dips at UI events and cuts are
       expected; dips mid-shot are a retake or a one-frame patch. With --min, frames below it are listed as "low".
       Exit 1 if any frame is low; dips alone are reported, not failed (take_qa.py rates them CHECK).

Calibration: shoot the plain page (no rig, same viewport, DPR and pose) after a 75 s real-clock hold and read the same
box. Set the gate at about 80 % of that (115 plain gave a gate of 90). Pick a box with fine fixed detail (a sign, roof
text, a facade) that no UI, cursor or animation crosses. Box coordinates are in source pixels (before --scale).
Needs numpy; ffmpeg on PATH.
"""
import argparse
import glob
import json
import os
import subprocess
import sys


def probe_size(src):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                          "-of", "csv=p=0", src], capture_output=True, text=True, check=True).stdout.strip().split(",")
    return int(out[0]), int(out[1])


def lapvar(np, y):
    lap = y[:-2, 1:-1] + y[2:, 1:-1] + y[1:-1, :-2] + y[1:-1, 2:] - 4 * y[1:-1, 1:-1]
    return float(lap.var())


def luma(np, rgb):
    rgb = rgb.astype(np.float64)
    return 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]


def read_rgb(np, src, frame=0, box=None, scale=1.0):
    """One frame as RGB (cropped to box, then scaled)."""
    W, H = probe_size(src)
    x0, y0, x1, y1 = box or (0, 0, W, H)
    w, h = x1 - x0, y1 - y0
    sw, sh = max(3, int(round(w * scale))), max(3, int(round(h * scale)))
    vf = f"select=eq(n\\,{frame}),crop={w}:{h}:{x0}:{y0}" + (f",scale={sw}:{sh}:flags=area" if scale != 1.0 else "")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-vf", vf, "-frames:v", "1", "-pix_fmt", "rgb24",
                          "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    if len(raw) < sw * sh * 3:
        raise SystemExit(f"could not read frame {frame} of {src}")
    return np.frombuffer(raw[:sw * sh * 3], np.uint8).reshape(sh, sw, 3)


def stream(src, box, scale, first, last, pattern=None):
    """Yield (frame_number, rgb) for every frame from first to last (inclusive, None = to the end)."""
    import numpy as np
    probe = pattern % first if pattern else src
    W, H = probe_size(probe)
    x0, y0, x1, y1 = box or (0, 0, W, H)
    w, h = x1 - x0, y1 - y0
    sw, sh = max(3, int(round(w * scale))), max(3, int(round(h * scale)))
    vf = f"crop={w}:{h}:{x0}:{y0}" + (f",scale={sw}:{sh}:flags=area" if scale != 1.0 else "")
    if pattern:
        cmd = ["ffmpeg", "-v", "error", "-start_number", str(first), "-i", pattern]
        n0 = first
    else:
        cmd = ["ffmpeg", "-v", "error", "-i", src]
        vf = f"select=gte(n\\,{first})," + vf
        n0 = first
    if last is not None:
        cmd += ["-frames:v", str(last - first + 1)]
    cmd += ["-vf", vf, "-fps_mode", "passthrough", "-pix_fmt", "rgb24", "-f", "rawvideo", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    n = n0
    size = sw * sh * 3
    while True:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        yield n, np.frombuffer(buf, np.uint8).reshape(sh, sw, 3)
        n += 1
    p.wait()


def frames_pattern(d):
    files = sorted(glob.glob(os.path.join(d, "f[0-9][0-9][0-9][0-9][0-9].png")))
    if not files:
        raise SystemExit(f"no f00000.png-style frames in {d}")
    return os.path.join(d, "f%05d.png"), int(os.path.basename(files[0])[1:6]), int(os.path.basename(files[-1])[1:6])


def scan(src, box=None, scale=0.5, first=0, last=None, window=6, dip=0.85, minimum=0.0):
    import numpy as np
    pattern = None
    if os.path.isdir(src):
        pattern, f0, f1 = frames_pattern(src)
        first = max(first, f0)
        last = f1 if last is None else min(last, f1)
    frames, vals = [], []
    for n, rgb in stream(src, box, scale, first, last, pattern):
        frames.append(n)
        vals.append(lapvar(np, luma(np, rgb)))
    v = np.array(vals)
    dips = []
    for i in range(len(v)):
        nb = np.r_[v[max(0, i - window):i], v[i + 1:i + 1 + window]]
        m = float(np.median(nb)) if len(nb) else float(v[i])
        if m > 0 and v[i] < dip * m:
            dips.append(dict(frame=frames[i], value=round(float(v[i]), 1), ratio=round(float(v[i] / m), 3)))
    low = [dict(frame=frames[i], value=round(float(v[i]), 1)) for i in range(len(v)) if minimum and v[i] < minimum]
    return dict(source=src, box=list(box) if box else None, scale=scale, frames=len(vals),
                first=frames[0] if frames else None, last=frames[-1] if frames else None,
                median=round(float(np.median(v)), 1) if len(v) else None,
                min_value=round(float(v.min()), 1) if len(v) else None, dip_ratio=dip, window=window,
                n_dips=len(dips), dips=dips[:200], gate_min=minimum or None, n_low=len(low), low=low[:200],
                values=[round(float(x), 2) for x in vals])


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    sub = ap.add_subparsers(dest="cmd", required=True)
    st = sub.add_parser("still", help="one reading per image or video frame")
    st.add_argument("src", nargs="+")
    st.add_argument("--box", nargs=4, type=int, metavar=("X0", "Y0", "X1", "Y1"))
    st.add_argument("--frame", type=int, default=0, help="video frame number (default 0)")
    st.add_argument("--min", type=float, default=0.0, help="exit 1 if any reading is below this")
    st.add_argument("--json")
    sc = sub.add_parser("scan", help="every frame, with dips against the neighbours")
    sc.add_argument("src", help="video file, or a folder of f00000.png frames")
    sc.add_argument("--box", nargs=4, type=int, metavar=("X0", "Y0", "X1", "Y1"))
    sc.add_argument("--first", type=int, default=0)
    sc.add_argument("--last", type=int)
    sc.add_argument("--scale", type=float, default=0.5)
    sc.add_argument("--window", type=int, default=6)
    sc.add_argument("--dip", type=float, default=0.85)
    sc.add_argument("--min", type=float, default=0.0, help="list frames below this as low; exit 1 if any")
    sc.add_argument("--json")
    a = ap.parse_args()
    try:
        import numpy as np
    except ImportError:
        sys.exit("needs numpy (pip install numpy)")
    if a.cmd == "still":
        rows = []
        for f in a.src:
            v = lapvar(np, luma(np, read_rgb(np, f, a.frame, a.box)))
            rows.append(dict(source=f, frame=a.frame, value=round(v, 1), ok=(v >= a.min) if a.min else None))
            print(f"{v:9.1f}  {f}" + (f"  frame {a.frame}" if a.frame else "") + ("" if not a.min else ("  PASS" if v >= a.min else "  BELOW GATE")))
        if a.json:
            json.dump(dict(box=a.box, min=a.min or None, readings=rows), open(a.json, "w"), indent=1)
        if a.min and any(not r["ok"] for r in rows):
            sys.exit(1)
    else:
        rep = scan(a.src, a.box, a.scale, a.first, a.last, a.window, a.dip, a.min)
        if a.json:
            json.dump(rep, open(a.json, "w"), indent=1)
        short = {k: v for k, v in rep.items() if k != "values"}
        short["dips"] = rep["dips"][:40]
        short["low"] = rep["low"][:40]
        print(json.dumps(short, indent=1))
        if rep["n_low"]:
            sys.exit(1)


if __name__ == "__main__":
    main()
