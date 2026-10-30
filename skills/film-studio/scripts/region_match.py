#!/usr/bin/env python3
"""Region-state gate: does a region of a take still match the page's own settled render?

Why: a streamed 3D page can settle into more than one state from the same camera. In Oct 2026 a row of trees came up
as bare branches on some page loads and as a canopy on others (the plain product always drew the canopy), and two takes
cut together then swapped state at the dissolve. Sharpness alone did not catch it (both states were sharp). The gate
compares a box of the take's gate still against a reference still of the plain page (no rig) at the same pose.

Usage:
  region_match.py <still> <reference> --box x0 y0 x1 y1 [--box ...] [--max 1.0] [--frame N] [--ref-frame N]
                  [--json out.json]

For each box: mean absolute luma difference (MAD, 0 to 255) between the still and the reference, plus each one's
sharpness (Laplacian variance), so a soft-but-same state and a sharp-but-different state read differently.
Exit 1 if any box's MAD is over --max (default 1.0).

Calibration (Oct 2026, 4K stills): same state 0.0 to 1.5 (after a small camera sweep); wrong state 4.4 to 5.7. Re-read
both on your own page before trusting a threshold: shoot the reference twice (two fresh loads) and set --max above the
same-state spread and well under a known-bad reading. Choose boxes with no UI, cursor, clock, animation or live data.
Images or videos (use --frame); both must be the same size. Needs numpy; ffmpeg on PATH.
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sharpness import lapvar, luma, probe_size, read_rgb  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    ap.add_argument("still")
    ap.add_argument("reference")
    ap.add_argument("--box", nargs=4, type=int, action="append", metavar=("X0", "Y0", "X1", "Y1"), required=True)
    ap.add_argument("--max", type=float, default=1.0, help="largest MAD that still counts as the same state")
    ap.add_argument("--frame", type=int, default=0)
    ap.add_argument("--ref-frame", type=int, default=0)
    ap.add_argument("--json")
    a = ap.parse_args()
    try:
        import numpy as np
    except ImportError:
        sys.exit("needs numpy (pip install numpy)")
    if probe_size(a.still) != probe_size(a.reference):
        sys.exit(f"size mismatch: {probe_size(a.still)} against {probe_size(a.reference)}")
    rows = []
    for box in a.box:
        y = luma(np, read_rgb(np, a.still, a.frame, box))
        r = luma(np, read_rgb(np, a.reference, a.ref_frame, box))
        mad = float(np.abs(y - r).mean())
        rows.append(dict(box=box, mad=round(mad, 2), ok=mad <= a.max, sharpness=round(lapvar(np, y), 1),
                         ref_sharpness=round(lapvar(np, r), 1)))
    rep = dict(still=a.still, reference=a.reference, max=a.max, ok=all(r["ok"] for r in rows), boxes=rows)
    if a.json:
        json.dump(rep, open(a.json, "w"), indent=1)
    print(json.dumps(rep, indent=1))
    if not rep["ok"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
