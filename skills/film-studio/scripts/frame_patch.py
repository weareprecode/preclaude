#!/usr/bin/env python3
"""One-frame patches on a captured frame sequence, written as a NEW sequence with a proof log.

Why: a take that is right except for one bad frame (a one-frame flash, a black "loading" frame, a tooltip that blinks
in for a frame) is cheaper and safer to patch than to retake, because a retake brings new timing, new streamed detail
and new judge work. Two kinds of patch, both from a neighbouring frame of the same take:
  whole  replace frame N with frame M (use when N and M are near identical apart from the fault; check the diff)
  pane   replace only a box of frame N with the same box of frame M (a tooltip, a placeholder thumbnail, a panel),
         leaving the rest of N (the moving map, the cursor) untouched
Never patch across motion that a viewer follows: if the box holds moving content, the patch shows as a stutter. A whole
patch on a moving shot is a repeated frame plus a double step, and take_qa.py flags exactly that (CHECK): look at it at
speed before ruling it with --allow. On a still shot (a UI hold) the two frames should be near identical: say so.

Usage:
  frame_patch.py <frames_dir> <out_dir> [--whole N=M ...] [--pane N=M:x0,y0,x1,y1 ...] [--copy]

Writes every frame of <frames_dir> to <out_dir> (hard links where possible, --copy to copy) and the patched frames as
new files, so the source sequence is never touched. patches.json records, per patch: the source frames, the box, the
SHA-256 of the original and patched frame, the mean change inside the box, and the largest change outside it (must
be 0 for a pane patch). Then re-encode <out_dir> and re-run take_qa.py on the result.
Frames are f00000.png ... (as film_rig.mjs writes them). Needs numpy and opencv-python.
"""
import argparse
import glob
import hashlib
import json
import os
import shutil
import sys


def sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def parse(spec, pane):
    try:
        if pane:
            nm, box = spec.split(":")
            box = tuple(int(v) for v in box.split(","))
            assert len(box) == 4 and box[0] < box[2] and box[1] < box[3]
        else:
            nm, box = spec, None
        n, m = (int(v) for v in nm.split("="))
        return n, m, box
    except (ValueError, AssertionError):
        raise SystemExit(f"bad patch spec {spec!r}: use N=M" + (":x0,y0,x1,y1" if pane else ""))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    ap.add_argument("frames_dir")
    ap.add_argument("out_dir")
    ap.add_argument("--whole", action="append", default=[], help="N=M: frame N becomes a copy of frame M")
    ap.add_argument("--pane", action="append", default=[], help="N=M:x0,y0,x1,y1: box of N from the same box of M")
    ap.add_argument("--copy", action="store_true", help="copy unpatched frames instead of hard-linking them")
    a = ap.parse_args()
    try:
        import cv2
        import numpy as np
    except ImportError:
        sys.exit("needs numpy and opencv-python (pip install numpy opencv-python)")
    src, out = os.path.abspath(a.frames_dir), os.path.abspath(a.out_dir)
    if src == out:
        sys.exit("out_dir must differ from frames_dir: the source sequence is never modified")
    patches = [parse(s, False) for s in a.whole] + [parse(s, True) for s in a.pane]
    if not patches:
        sys.exit("nothing to do: give at least one --whole or --pane")
    targets = [n for n, _, _ in patches]
    if len(set(targets)) != len(targets):
        sys.exit("one patch per frame: combine boxes by patching in two passes")
    files = sorted(glob.glob(os.path.join(src, "f[0-9][0-9][0-9][0-9][0-9].png")))
    if not files:
        sys.exit(f"no f00000.png-style frames in {src}")
    have = {int(os.path.basename(f)[1:6]) for f in files}
    for n, m, _ in patches:
        if n not in have or m not in have:
            sys.exit(f"frame {n} or {m} is not in {src}")
        if abs(n - m) > 2:
            print(f"warning: frame {n} patched from {m}, {abs(n - m)} frames away; check for motion", file=sys.stderr)
    os.makedirs(out, exist_ok=True)
    if glob.glob(os.path.join(out, "f[0-9][0-9][0-9][0-9][0-9].png")):
        sys.exit(f"{out} already holds frames: choose a new folder (never overwrite a sequence)")
    fname = lambda d, i: os.path.join(d, f"f{i:05d}.png")  # noqa: E731
    for f in files:
        i = int(os.path.basename(f)[1:6])
        if i in targets:
            continue
        dst = os.path.join(out, os.path.basename(f))
        if a.copy:
            shutil.copy2(f, dst)
        else:
            try:
                os.link(f, dst)
            except OSError:
                shutil.copy2(f, dst)
    log = []
    for n, m, box in patches:
        A = cv2.imread(fname(src, n), cv2.IMREAD_UNCHANGED)
        B = cv2.imread(fname(src, m), cv2.IMREAD_UNCHANGED)
        if A is None or B is None or A.shape != B.shape:
            sys.exit(f"cannot read frames {n}/{m} or their sizes differ")
        H, W = A.shape[:2]
        P = B.copy() if box is None else A.copy()
        mask = np.ones((H, W), bool) if box is None else np.zeros((H, W), bool)
        if box is not None:
            x0, y0, x1, y1 = box
            if x1 > W or y1 > H:
                sys.exit(f"box {box} is outside the {W}x{H} frame")
            P[y0:y1, x0:x1] = B[y0:y1, x0:x1]
            mask[y0:y1, x0:x1] = True
        cv2.imwrite(fname(out, n), P)
        d = np.abs(P.astype(np.int16) - A.astype(np.int16))
        d = d.max(axis=2) if d.ndim == 3 else d
        log.append(dict(frame=n, source_frame=m, kind="whole" if box is None else "pane", box=box,
                        sha256_before=sha(fname(src, n)), sha256_after=sha(fname(out, n)),
                        mean_change_inside=round(float(d[mask].mean()), 3),
                        max_change_outside=int(d[~mask].max()) if (~mask).any() else 0))
    rep = dict(source=src, out=out, frames=len(files), linked=not a.copy, patches=log)
    json.dump(rep, open(os.path.join(out, "patches.json"), "w"), indent=1)
    print(json.dumps(rep, indent=1))
    if any(p["kind"] == "pane" and p["max_change_outside"] != 0 for p in log):
        sys.exit("a pane patch changed pixels outside its box")


if __name__ == "__main__":
    main()
