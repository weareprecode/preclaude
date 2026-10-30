#!/usr/bin/env python3
"""Contact sheets for review and forensics: frames stamped with time and frame number, optional 100 % to 3x crops.

Usage:
  contact_sheet.py <video> <out.jpg> [--every 2.5 | --fps 2 | --frames 0,16,32 | --count 24] [--cols 6] [--width 320]
                   [--t0 0 --t1 END] [--crop x0 y0 x1 y1] [--zoom 3] [--bg 11,18,32] [--no-stamp]

Uses:
  - review sheet: one frame every 2.5 s, 6 columns, on the film's ground colour; send it with every review encode.
  - generation screening: --count 6 per take (first, middle and last matter most: generators morph at the ends).
  - forensics: --crop around a plate, badge, hand or screen with --zoom 3 and --fps equal to the clip rate, to step
    through every frame of a blur exit (check from 6 frames before a blur starts to 6 after it ends) or every
    interpolated frame for ghosting. Judge at 100 % or more, never on a half-scale grid.
--frames takes source frame numbers; --every/--fps/--count sample by time. Stamps read "12.40s f372".
Needs numpy and opencv-python.
"""
import argparse
import sys


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    ap.add_argument("video")
    ap.add_argument("out")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--every", type=float, help="one frame every N seconds (default 2.5)")
    g.add_argument("--fps", type=float, help="frames per second to sample")
    g.add_argument("--frames", help="comma-separated frame numbers")
    g.add_argument("--count", type=int, help="this many frames spread evenly (first and last included)")
    ap.add_argument("--cols", type=int, default=6)
    ap.add_argument("--width", type=int, default=320, help="thumbnail width (ignored with --zoom)")
    ap.add_argument("--t0", type=float, default=0.0)
    ap.add_argument("--t1", type=float, default=1e9)
    ap.add_argument("--crop", nargs=4, type=int, metavar=("X0", "Y0", "X1", "Y1"))
    ap.add_argument("--zoom", type=float, help="scale the crop by this factor (nearest neighbour) instead of --width")
    ap.add_argument("--bg", default="11,18,32", help="sheet ground colour R,G,B (default navy)")
    ap.add_argument("--no-stamp", action="store_true")
    a = ap.parse_args()
    try:
        import cv2
        import numpy as np
    except ImportError:
        sys.exit("needs numpy and opencv-python (pip install numpy opencv-python)")
    cap = cv2.VideoCapture(a.video)
    vfps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    lo, hi = int(a.t0 * vfps), min(total - 1, int(a.t1 * vfps))
    if a.frames:
        want = {int(x) for x in a.frames.split(",") if x.strip()}
    elif a.count:
        want = {int(round(lo + (hi - lo) * i / max(1, a.count - 1))) for i in range(a.count)}
    else:
        step = vfps / a.fps if a.fps else vfps * (a.every or 2.5)
        want, x = set(), float(lo)
        while x <= hi:
            want.add(int(round(x)))
            x += max(1.0, step)
    thumbs, i = [], 0
    while True:
        ok, fr = cap.read()
        if not ok or i > max(want):
            break
        if i in want:
            if a.crop:
                x0, y0, x1, y1 = a.crop
                fr = fr[y0:y1, x0:x1]
            h, w = fr.shape[:2]
            if a.zoom:
                im = cv2.resize(fr, (int(w * a.zoom), int(h * a.zoom)), interpolation=cv2.INTER_NEAREST)
            else:
                tw = a.width
                im = cv2.resize(fr, (tw, int(h * tw / w)), interpolation=cv2.INTER_AREA if tw < w else cv2.INTER_LANCZOS4)
            if not a.no_stamp:
                lab = f"{i / vfps:5.2f}s f{i}"
                cv2.rectangle(im, (0, 0), (8 + 11 * len(lab), 24), (0, 0, 0), -1)
                cv2.putText(im, lab, (4, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 255), 1, cv2.LINE_AA)
            thumbs.append(im)
        i += 1
    if not thumbs:
        sys.exit("no frames selected")
    th, tw = thumbs[0].shape[:2]
    cols = min(a.cols, len(thumbs))
    rows = (len(thumbs) + cols - 1) // cols
    r, g_, b = (int(v) for v in a.bg.split(","))
    sheet = np.zeros((rows * (th + 4) + 4, cols * (tw + 4) + 4, 3), np.uint8)
    sheet[:] = (b, g_, r)
    for k, im in enumerate(thumbs):
        rr, cc = divmod(k, cols)
        y, x = 4 + rr * (th + 4), 4 + cc * (tw + 4)
        sheet[y:y + im.shape[0], x:x + im.shape[1]] = im
    cv2.imwrite(a.out, sheet, [cv2.IMWRITE_JPEG_QUALITY, 90])
    print(a.out, len(thumbs), "frames", sheet.shape[1], "x", sheet.shape[0])


if __name__ == "__main__":
    main()
