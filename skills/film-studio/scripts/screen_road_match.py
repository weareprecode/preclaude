#!/usr/bin/env python3
"""Make the navigation screen agree with the road: measure both headings, then pick a capture window that matches.

Rule (reviewer, 18 Oct 2026): when a real navigation-app recording is comped into car footage, a straight road shows a straight route,
a bend bends the same way at the same moment, a turn on screen happens when the car turns. Match by measurement; if
nothing matches, drop the screen or the shot. Never generate UI to fake a match.

  screen_road_match.py plate-yaw <plate.mp4> --vp X Y [--cabin x0 y0 x1 y1] [--hfov 80 | --focal-px F] <out.csv>
      Yaw from phase correlation on a patch at the road's vanishing point (far scene, near-zero parallax), minus the
      cabin's own shift (camera sway) when --cabin gives a static interior box. Writes frame, yaw_deg, heading_cum_deg.
      (A whole-frame flow regression was noisier, up to 17 degrees out; use it only as a cross-check.)

  screen_road_match.py screen-heading <capture.mp4> --map x0 y0 x1 y1 <out.csv>
      For a heading-up map, the map's rotation between frames is the route's heading change. Measured with ECC
      (Euclidean) on the map area only (crop out the turn card, buttons and trip bar). Left turn positive.

  screen_road_match.py match <plate.csv> <screen.csv> [--plate-fps 24 --screen-fps 30 --speed 1.0]
                             [--rms-max 3] [--abs-max 6] [--turn-deg 10] [--avoid a-b,c-d] [--json out.json]
      Both series are zeroed at the cut's first frame and compared one output frame at a time (one plate frame = one
      output frame after a frame-for-frame conform; set --speed to the conform factor, e.g. 1.25 for 24 -> 30).
      Scores every start frame of the capture and lists qualifying windows best first (heading RMS <= --rms-max and
      max error <= --abs-max degrees). --avoid lists capture ranges (in screen frames) already used by other clips, so
      every made clip shows a DIFFERENT real screen segment.

Also check by hand, with tolerances written down BEFORE scoring (only ever tighten them after):
  - no turn in the plate (under --turn-deg total yaw): the next manoeuvre card stays at least 60 yd away (100 yd where
    no junction is visible);
  - plate speed (from centre-line dash rate) within 0.6 to 1.6x of the speed the screen implies, and legal;
  - the screen clock agrees with the light in the plate (day capture around 10:30, night around 22:20, say).
In-car v3 result: 10 of 12 cuts passed with RMS <= 3 degrees and 0 repeat frames.
Needs numpy and opencv-python; ffmpeg/ffprobe on PATH.
"""
import argparse
import csv
import json
import math
import subprocess
import sys


def deps():
    try:
        import cv2
        import numpy as np
        return cv2, np
    except ImportError:
        sys.exit("needs numpy and opencv-python (pip install numpy opencv-python)")


def frames_gray(path, cv2):
    cap = cv2.VideoCapture(path)
    while True:
        ok, f = cap.read()
        if not ok:
            break
        yield cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype("float32")


def write(out, rows):
    with open(out, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["frame", "yaw_deg", "heading_cum_deg"])
        cum = 0.0
        w.writerow([0, "0.0000", "0.000"])
        for i, y in enumerate(rows, 1):
            cum += y
            w.writerow([i, f"{y:.4f}", f"{cum:.3f}"])
    print(f"{out}: {len(rows) + 1} frames, total {sum(rows):+.1f} deg")


def plate_yaw(a):
    cv2, np = deps()
    fr = list(frames_gray(a.plate, cv2))
    H, W = fr[0].shape
    fpx = a.focal_px or (W / 2) / math.tan(math.radians(a.hfov / 2))
    pw, ph = 200, 120
    win = cv2.createHanningWindow((pw, ph), cv2.CV_32F)
    x, y = a.vp
    yaw = []
    for k in range(len(fr) - 1):
        x0, y0 = int(np.clip(x - pw / 2, 0, W - pw)), int(np.clip(y - ph / 2, 0, H - ph))
        (dx, dy), _ = cv2.phaseCorrelate(fr[k][y0:y0 + ph, x0:x0 + pw], fr[k + 1][y0:y0 + ph, x0:x0 + pw], win)
        cdx = 0.0
        if a.cabin:
            cx0, cy0, cx1, cy1 = a.cabin
            (cdx, _), _ = cv2.phaseCorrelate(fr[k][cy0:cy1, cx0:cx1], fr[k + 1][cy0:cy1, cx0:cx1])
        d = dx - cdx
        yaw.append(-float(math.degrees(math.atan(d / fpx))))  # scene moving right = camera turning left = positive
        x += dx
    write(a.out, yaw)


def screen_heading(a):
    cv2, np = deps()
    x0, y0, x1, y1 = a.map
    prev, rot = None, []
    for g in frames_gray(a.capture, cv2):
        m = cv2.resize(g[y0:y1, x0:x1], None, fx=0.25, fy=0.25) / 255.0
        if prev is not None:
            warp = np.eye(2, 3, dtype=np.float32)
            try:
                _, warp = cv2.findTransformECC(prev, m, warp, cv2.MOTION_EUCLIDEAN,
                                               (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 60, 1e-5), None, 3)
                ang = math.degrees(math.atan2(warp[1, 0], warp[0, 0]))
            except cv2.error:
                ang = 0.0
            rot.append(ang)  # map rotates clockwise on screen when the route turns left (heading-up)
        prev = m
    write(a.out, rot)


def load(path):
    return [float(r["heading_cum_deg"]) for r in csv.DictReader(open(path))]


def match(a):
    _, np = deps()
    P = np.array(load(a.plate))
    S = np.array(load(a.screen))
    # resample the screen series onto plate output frames: output frame k shows plate frame k and screen time
    # k / out_fps; out_fps = plate_fps * speed
    out_fps = a.plate_fps * a.speed
    n = len(P)
    need = int(math.ceil((n - 1) / out_fps * a.screen_fps)) + 1
    avoid = []
    for r in (a.avoid.split(",") if a.avoid else []):
        lo, hi = (int(v) for v in r.split("-"))
        avoid.append((lo, hi))
    p = P - P[0]
    turn = bool(np.max(np.abs(p)) >= a.turn_deg)
    res = []
    for s in range(0, len(S) - need):
        t = s + np.arange(n) / out_fps * a.screen_fps
        sh = np.interp(t, np.arange(len(S)), S)
        sh = sh - sh[0]
        d = p - sh
        rms, mx = float(np.sqrt(np.mean(d ** 2))), float(np.max(np.abs(d)))
        overlap = sum(max(0, min(s + need, hi) - max(s, lo)) for lo, hi in avoid)
        if rms <= a.rms_max and mx <= a.abs_max and overlap == 0:
            res.append(dict(screen_start_frame=s, screen_start_s=round(s / a.screen_fps, 3),
                            screen_end_frame=s + need, rms_deg=round(rms, 2), max_deg=round(mx, 2)))
    res.sort(key=lambda r: r["rms_deg"])
    out = dict(plate=a.plate, screen=a.screen, plate_frames=n, plate_total_yaw_deg=round(float(p[-1]), 1),
               plate_max_abs_heading_deg=round(float(np.max(np.abs(p))), 1), turn_taken=turn,
               tolerances=dict(rms_max=a.rms_max, abs_max=a.abs_max), qualifying_windows=len(res), best=res[:10],
               verdict="MATCH" if res else "NO MATCH: trim the cut, record a new capture, or keep the screen black")
    if a.json:
        json.dump(out, open(a.json, "w"), indent=1)
    print(json.dumps(out, indent=1))
    if not res:
        sys.exit(1)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("plate-yaw")
    p.add_argument("plate")
    p.add_argument("--vp", nargs=2, type=float, required=True, metavar=("X", "Y"), help="vanishing point in pixels")
    p.add_argument("--cabin", nargs=4, type=int, metavar=("X0", "Y0", "X1", "Y1"), help="static cabin box for sway")
    p.add_argument("--hfov", type=float, default=80.0, help="horizontal field of view in degrees (default 80)")
    p.add_argument("--focal-px", type=float, help="focal length in pixels (overrides --hfov)")
    p.add_argument("out")
    s = sub.add_parser("screen-heading")
    s.add_argument("capture")
    s.add_argument("--map", nargs=4, type=int, required=True, metavar=("X0", "Y0", "X1", "Y1"),
                   help="map area only (no turn card, buttons or trip bar)")
    s.add_argument("out")
    m = sub.add_parser("match")
    m.add_argument("plate", help="plate-yaw CSV")
    m.add_argument("screen", help="screen-heading CSV")
    m.add_argument("--plate-fps", type=float, default=24.0)
    m.add_argument("--screen-fps", type=float, default=30.0)
    m.add_argument("--speed", type=float, default=1.0, help="conform speed factor (1.25 for 24 -> 30 frame for frame)")
    m.add_argument("--rms-max", type=float, default=3.0)
    m.add_argument("--abs-max", type=float, default=6.0)
    m.add_argument("--turn-deg", type=float, default=10.0)
    m.add_argument("--avoid", help="screen frame ranges already used, e.g. 0-120,300-410")
    m.add_argument("--json")
    a = ap.parse_args()
    {"plate-yaw": plate_yaw, "screen-heading": screen_heading, "match": match}[a.cmd](a)


if __name__ == "__main__":
    main()
