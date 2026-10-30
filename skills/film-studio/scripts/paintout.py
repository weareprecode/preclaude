#!/usr/bin/env python3
"""Paint out a small mark (a boiling road blob, a stray logo, a sensor speck) using only pixels from the SAME frame.

Nothing is generated: each masked row is filled by blending the pixels just left and right of the mask along the
surface direction, then the frame's own fine grain is added back from a patch further along the surface, so the patch
moves with the camera and carries real, frame-varying grain (never a smooth or frozen fill).

Usage:
  paintout.py <in.mp4> <out.mp4> --marks marks.json [--fps SAME] [--crf 12] [--log log.json] [--before-after sheet.jpg]

marks.json: a list of marks, each with keyframed boxes (frame numbers, pixels) and the surface direction:
  [{"label": "road blob A",
    "keys": [{"frame": 0, "box": [925, 405, 965, 455]}, {"frame": 63, "box": [645, 405, 685, 455]}],
    "slope": 0.0,          # rows follow y = y0 + slope * dx (0 = horizontal surface lines; measure it on the plate)
    "grain_dx": 80,        # take grain from this many px along the surface (sign picks the side)
    "pad": 3,              # grow the mask by this many px
    "feather": 2.0,        # px of soft edge
    "edge_width": 5}]      # px averaged either side of the mask for the fill
Boxes are interpolated linearly between keys; a mark exists only between its first and last key.

Proof (do this, do not skip): measure local boil (block residual against a 5-frame median) inside the patch before
and after, and compare with clean surface nearby. Aerial plate, Oct 2026: 1.66 -> 0.24, inside clean asphalt's 0.15 to 0.44.
Then re-run ocr_gate.sh and frame_qa.py on the output, and look at --before-after at 100 %.
A large patch reads as an edit; if the mark is big, trim or kill the shot instead.
Needs numpy and opencv-python; ffmpeg/ffprobe on PATH.
"""
import argparse
import json
import subprocess
import sys


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--marks", required=True, help="marks.json")
    ap.add_argument("--fps", type=float, help="output rate (default: same as input)")
    ap.add_argument("--crf", type=int, default=12)
    ap.add_argument("--log", help="write per-frame mask sizes here")
    ap.add_argument("--before-after", help="write a before/after crop sheet (jpg) here")
    a = ap.parse_args()
    try:
        import cv2
        import numpy as np
    except ImportError:
        sys.exit("needs numpy and opencv-python (pip install numpy opencv-python)")

    pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height,r_frame_rate",
                         "-of", "csv=p=0", a.input], capture_output=True, text=True, check=True).stdout.strip().split(",")
    W, H = int(pr[0]), int(pr[1])
    n_, d_ = pr[2].split("/")
    fps = a.fps or float(n_) / float(d_)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.input, "-fps_mode", "passthrough", "-f", "rawvideo",
                          "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
    clip = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    marks = json.load(open(a.marks))

    def box_at(m, k):
        ks = sorted(m["keys"], key=lambda x: x["frame"])
        if k < ks[0]["frame"] or k > ks[-1]["frame"]:
            return None
        for p, q in zip(ks, ks[1:] + [ks[-1]]):
            if p["frame"] <= k <= q["frame"]:
                u = 0 if q["frame"] == p["frame"] else (k - p["frame"]) / (q["frame"] - p["frame"])
                return [p["box"][i] + (q["box"][i] - p["box"][i]) * u for i in range(4)]
        return ks[-1]["box"]

    def grain_from(f, dx, dy):
        sh = np.roll(np.roll(f.astype(np.float32), -dy, 0), -dx, 1)
        return sh - cv2.GaussianBlur(sh, (0, 0), 1.2)

    def rowfill(f, mask, slope, grain, ramp, ew):
        F = f.astype(np.float32)
        out = F.copy()
        ys, _ = np.where(mask > 0)
        if len(ys) == 0:
            return f
        for y in range(ys.min(), ys.max() + 1):
            row = np.where(mask[y] > 0)[0]
            if len(row) == 0:
                continue
            xa, xb = row.min(), row.max()
            xl, xr = max(0, xa - 1 - ew // 2), min(W - 1, xb + 1 + ew // 2)
            x = np.arange(xa, xb + 1, dtype=np.float32)
            t = ((x - xl) / max(1, xr - xl))[:, None]

            def samp(xc):
                yy = (y + slope * (xc - x)).astype(np.float32)
                v = [cv2.remap(F, np.full_like(x, xc + o)[None, :], yy[None, :], cv2.INTER_LINEAR,
                               borderMode=cv2.BORDER_REFLECT)[0] for o in range(-(ew // 2), ew // 2 + 1)]
                return np.mean(v, 0)
            if xa <= 2:
                out[y, xa:xb + 1] = samp(xr) + grain[y, xa:xb + 1]
            elif xb >= W - 3:
                out[y, xa:xb + 1] = samp(xl) + grain[y, xa:xb + 1]
            else:
                out[y, xa:xb + 1] = (1 - t) * samp(xl) + t * samp(xr) + grain[y, xa:xb + 1]
        al = np.clip(cv2.distanceTransform((mask > 0).astype(np.uint8), cv2.DIST_L2, 3) / ramp, 0, 1)[..., None]
        return np.clip(F * (1 - al) + out * al + 0.5, 0, 255).astype(np.uint8)

    out = clip.copy()
    log = []
    for k in range(len(clip)):
        f = out[k]
        rec = {"frame": k}
        for m in marks:
            b = box_at(m, k)
            if b is None:
                continue
            pad = m.get("pad", 3)
            mask = np.zeros((H, W), np.uint8)
            cv2.rectangle(mask, (int(round(b[0] - pad)), int(round(b[1] - pad))),
                          (int(round(b[2] + pad)), int(round(b[3] + pad))), 255, -1)
            dx = int(m.get("grain_dx", 80))
            slope = float(m.get("slope", 0.0))
            f = rowfill(f, mask, slope, grain_from(f, dx, int(round(slope * dx))), m.get("feather", 2.0),
                        int(m.get("edge_width", 5)))
            rec[m.get("label", "mark")] = int((mask > 0).sum())
        out[k] = f
        log.append(rec)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                            "-r", str(fps), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", str(a.crf),
                            "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
                            "-movflags", "+faststart", a.output], stdin=subprocess.PIPE)
    enc.stdin.write(np.ascontiguousarray(out).tobytes())
    enc.stdin.close()
    enc.wait()
    if a.log:
        json.dump(dict(input=a.input, marks=marks, per_frame=log), open(a.log, "w"), indent=1)
    if a.before_after:
        tiles = []
        for m in marks:
            ks = sorted(m["keys"], key=lambda x: x["frame"])
            for k in sorted({ks[0]["frame"], (ks[0]["frame"] + ks[-1]["frame"]) // 2, ks[-1]["frame"]}):
                if k >= len(clip):
                    continue
                b = box_at(m, k)
                cx, cy = int((b[0] + b[2]) / 2), int((b[1] + b[3]) / 2)
                x0, y0 = max(0, cx - 80), max(0, cy - 60)
                x1, y1 = min(W, x0 + 160), min(H, y0 + 120)
                pair = np.hstack([clip[k][y0:y1, x0:x1], out[k][y0:y1, x0:x1]])
                tiles.append(cv2.resize(pair, (pair.shape[1] * 3, pair.shape[0] * 3), interpolation=cv2.INTER_NEAREST))
        if tiles:
            wmax = max(t.shape[1] for t in tiles)
            sheet = np.vstack([np.pad(t, ((0, 4), (0, wmax - t.shape[1]), (0, 0))) for t in tiles])
            cv2.imwrite(a.before_after, cv2.cvtColor(sheet, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 92])
    print(json.dumps(dict(output=a.output, frames=len(clip), marks=len(marks))))


if __name__ == "__main__":
    main()
