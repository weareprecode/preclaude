#!/usr/bin/env python3
"""Grade-match generated plates to the host film: privacy blur, black floor, highlight roll-off, matched grain, conform.

Usage:
  grade_match.py <plates.json> [--only ID ...] [--log-dir DIR] [--src-fps 24] [--out-fps 30] [--crf 14]

Per plate, in this fixed order (comp lane, Oct 2026):
  1. Trim to the usable window (generated clips morph at both ends: drop about 0.4 s each side).
  2. Privacy blur at native resolution: automatic UK yellow rear-plate finder, optional white front-plate finder inside
     a zone, hand-keyed boxes (keyframes, linear interpolation) and template-tracked boxes. Feathered.
  3. Grade: ONE common black and white point over all channels (keeps the plate's own colour), mapped onto the target
     black floor RGB and highlight RGB with a soft shoulder (linear to 0.8, eases to 1.0, never clips). Gamma clamped to
     0.7 to 1.5 and the rest by exposure, so a big darkening reads as under-exposure, not crushed mid-tones (gamma alone
     needed 2.7 to 3.8). Optional ramp to a second target luma and an eased tail towards an RGB (cut into a navy card).
  4. Optional real-screen comp (screen_comp.py next to this file): a real capture on the tracked blank screen.
  5. Lanczos upscale to 1920x1080 (or 1080x1920 for portrait plates).
  6. Grain matched to the plate's own measured noise (MAD of the high-pass in flat mid-tones), luminance weighted with a
     floor, fresh every frame, seeded per plate. Seedance plates measure 0.0 to 1.3 and look plastic, so a 1.2 floor.
  7. Conform frame for frame: each source frame becomes one output frame (24p -> 30p plays 1.25x). No repeats.
  8. Encode x264 slow CRF 14, yuv420p, BT.709 tags, faststart, and an MP4 comment saying the plate is AI-generated.
Writes <out_dir>/MADE-<id>-graded.mp4 and <log-dir>/<id>.json (before/after stats, grain, blur counts).
Result on 35 plates: all within 5.6 levels of target mean luma.

plates.json:
{
  "plate_dir": "/abs/plates", "out_dir": "/abs/graded", "stills_dir": "/abs/stills (optional)",
  "comment": "MADE: AI-generated plate (generator, model). Any screen content is a real capture.",
  "plates": [{
     "id": "aerial-2", "plate": "MADE-aerial-2.mp4", "src": [6, 69],            # source frame range, inclusive
     "hflip": false,
     "grade": {"floor": [5,16,27], "hi": [242,241,237], "target_luma": 70,      # measure these from the host frames
               "target_luma_end": null, "ramp_from": 0.0,
               "tail": {"frames": 12, "rgb": [8,16,32], "amount": 1.0, "mode": "gain|offset"}},
     "auto_yellow": true, "yellow_zone": [0,0.3,1,1], "white_zone": [0.1,0.4,0.9,0.9],
     "blur": [{"label": "badge", "sigma": 7, "keys": [[0.5, x0,y0,x1,y1], [1.2, x0,y0,x1,y1]]}],   # seconds, plate px
     "blur_track": [{"label": "plate", "seed_t": 1.0, "box": [x0,y0,x1,y1], "t0": 0.4, "t1": 2.6, "search": 24, "pad": 4}],
     "grain_target": null, "grain_min": 1.2,
     "screen": {... screen_comp.py spec ...}
  }]
}
Measure host targets from the frames either side of each slot (30 before, 30 after): luma p2/p50/p98 and the mean RGB
of the darkest and brightest 10 %. Seedance crushes blacks (p2 0.0 to 0.1) and clips day highlights at 245 to 253.
Needs numpy and opencv-python; ffmpeg/ffprobe on PATH.
"""
import argparse
import json
import os
import subprocess
import sys
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))


def run(a):
    try:
        import cv2
        import numpy as np
    except ImportError:
        sys.exit("needs numpy and opencv-python (pip install numpy opencv-python)")
    LUMA = np.array([0.2126, 0.7152, 0.0722], np.float32)

    def decode(src, s0, s1, hflip=False):
        w, h = [int(v) for v in subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries",
                                                "stream=width,height", "-of", "csv=p=0", src],
                                               capture_output=True, text=True, check=True).stdout.strip().split(",")]
        cmd = ["ffmpeg", "-v", "error", "-i", src] + (["-vf", "hflip"] if hflip else []) + [
            "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
        raw = subprocess.run(cmd, capture_output=True, check=True).stdout
        n = len(raw) // (w * h * 3)
        allf = np.frombuffer(raw[: n * w * h * 3], np.uint8).reshape(n, h, w, 3)
        return allf[s0:s1 + 1].copy()

    def yellow_plate_boxes(fr):
        hsv = cv2.cvtColor(fr, cv2.COLOR_RGB2HSV)
        m = cv2.inRange(hsv, (16, 115, 115), (30, 255, 255))
        n, _, st, _ = cv2.connectedComponentsWithStats(m, 8)
        H, W = m.shape
        out = []
        for i in range(1, n):
            x, y, bw, bh, area = st[i]
            if not (6 <= bw <= 120 and 3 <= bh <= 34 and 1.8 <= bw / max(bh, 1) <= 6.0 and area >= 0.5 * bw * bh):
                continue
            r = max(4, bh)
            ring = hsv[max(0, y - r):min(H, y + bh + r), max(0, x - r):min(W, x + bw + r)]
            inner = hsv[y:y + bh, x:x + bw]
            if (cv2.inRange(ring, (16, 115, 115), (30, 255, 255)) > 0).mean() > 0.45:
                continue  # part of a big yellow area (a sign, a wall), not a plate
            if float(inner[..., 2].mean()) - float(ring[..., 2].mean()) < 15 and float(ring[..., 1].mean()) > 70:
                continue  # grass, warm brick
            p = max(3, bh // 2)
            out.append((max(0, x - p), max(0, y - p), min(W, x + bw + p), min(H, y + bh + p)))
        return out

    def white_plate_boxes(fr, zone):
        H, W = fr.shape[:2]
        zx0, zy0, zx1, zy1 = int(zone[0] * W), int(zone[1] * H), int(zone[2] * W), int(zone[3] * H)
        hsv = cv2.cvtColor(fr[zy0:zy1, zx0:zx1], cv2.COLOR_RGB2HSV)
        m = cv2.morphologyEx(cv2.inRange(hsv, (0, 0, 165), (180, 55, 255)), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        n, _, st, _ = cv2.connectedComponentsWithStats(m, 8)
        out = []
        for i in range(1, n):
            x, y, bw, bh, area = st[i]
            if not (10 <= bw <= 90 and 4 <= bh <= 24 and 2.5 <= bw / max(bh, 1) <= 6.0 and area >= 0.45 * bw * bh):
                continue
            dark = (hsv[y:y + bh, x:x + bw, 2] < 120).mean()
            if not (0.05 <= dark <= 0.55):
                continue
            p = max(3, bh // 2)
            out.append((max(0, zx0 + x - p), max(0, zy0 + y - p), min(W, zx0 + x + bw + p), min(H, zy0 + y + bh + p)))
        return out

    def interp_box(keys, t):
        if t < keys[0][0] - 1e-6 or t > keys[-1][0] + 1e-6:
            return None
        for p, q in zip(keys, keys[1:]):
            if p[0] <= t <= q[0]:
                u = 0 if q[0] == p[0] else (t - p[0]) / (q[0] - p[0])
                return [p[i] + (q[i] - p[i]) * u for i in range(1, 5)]
        return keys[-1][1:]

    def track_box(clip, s0, fps, b):
        n = len(clip)
        gray = [cv2.cvtColor(f, cv2.COLOR_RGB2GRAY) for f in clip]
        ks = min(n - 1, max(0, int(round(b["seed_t"] * fps)) - s0))
        x0, y0, x1, y1 = [int(v) for v in b["box"]]
        out = [None] * n
        rad = b.get("search", 24)
        H, W = gray[0].shape
        for direction in (1, -1):
            bx, k = [x0, y0, x1, y1], ks
            while 0 <= k < n:
                out[k] = list(bx)
                nk = k + direction
                if not (0 <= nk < n):
                    break
                tpl = gray[k][max(0, bx[1]):bx[3], max(0, bx[0]):bx[2]]
                sx0, sy0 = max(0, bx[0] - rad), max(0, bx[1] - rad)
                win = gray[nk][sy0:min(H, bx[3] + rad), sx0:min(W, bx[2] + rad)]
                if tpl.size == 0 or win.shape[0] < tpl.shape[0] or win.shape[1] < tpl.shape[1]:
                    break
                _, _, _, loc = cv2.minMaxLoc(cv2.matchTemplate(win, tpl, cv2.TM_CCOEFF_NORMED))
                dx, dy = sx0 + loc[0] - max(0, bx[0]), sy0 + loc[1] - max(0, bx[1])
                bx = [bx[0] + dx, bx[1] + dy, bx[2] + dx, bx[3] + dy]
                k = nk
        pad = b.get("pad", 4)
        res = []
        for k in range(n):
            t = (s0 + k) / fps
            res.append(None if out[k] is None or t < b.get("t0", -1) or t > b.get("t1", 1e9)
                       else [out[k][0] - pad, out[k][1] - pad, out[k][2] + pad, out[k][3] + pad])
        return res

    def blur_region(img, box, sigma, feather=4):
        H, W = img.shape[:2]
        x0, y0, x1, y1 = [int(round(v)) for v in box]
        pad = int(feather * 2 + sigma * 2)
        X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad), min(H, y1 + pad)
        if X1 <= X0 or Y1 <= Y0:
            return 0
        roi = img[Y0:Y1, X0:X1].astype(np.float32)
        bl = cv2.GaussianBlur(roi, (0, 0), sigma)
        m = np.zeros(roi.shape[:2], np.float32)
        m[max(0, y0 - Y0):y1 - Y0, max(0, x0 - X0):x1 - X0] = 1
        m = cv2.GaussianBlur(m, (0, 0), feather)[..., None]
        img[Y0:Y1, X0:X1] = np.clip(roi * (1 - m) + bl * m, 0, 255).astype(np.uint8)
        return 1

    def noise_sigma(gray):
        g = gray.astype(np.float32)
        res = g - cv2.GaussianBlur(g, (0, 0), 1.2)
        grad = cv2.GaussianBlur(np.abs(cv2.Sobel(g, cv2.CV_32F, 1, 0)) + np.abs(cv2.Sobel(g, cv2.CV_32F, 0, 1)), (0, 0), 2)
        m = (grad < np.percentile(grad, 30)) & (g > 30) & (g < 220)
        if m.sum() < 500:
            m = grad < np.percentile(grad, 30)
        r = res[m]
        return 0.0 if r.size < 50 else float(1.4826 * np.median(np.abs(r - np.median(r))))

    def shoulder(x):
        return np.where(x < 0.8, x, 0.8 + 0.2 * (1 - np.exp(-(x - 0.8) / 0.2)))

    def tone(n01, floor, hi, gam, ex):
        return floor + (hi - floor) * shoulder(np.power(n01, gam) * ex)

    def solve_tone(n01, floor, hi, target, gmin=0.7, gmax=1.5):
        lo_g, hi_g = 0.2, 5.0
        for _ in range(40):
            g = (lo_g + hi_g) / 2
            m = float((tone(n01, floor, hi, g, 1.0) * LUMA).sum(-1).mean())
            lo_g, hi_g = (g, hi_g) if m > target else (lo_g, g)
        g = min(gmax, max(gmin, (lo_g + hi_g) / 2))
        lo_e, hi_e = 0.05, 6.0
        for _ in range(40):
            e = (lo_e + hi_e) / 2
            m = float((tone(n01, floor, hi, g, e) * LUMA).sum(-1).mean())
            lo_e, hi_e = (lo_e, e) if m > target else (e, hi_e)
        return g, (lo_e + hi_e) / 2

    def ease(u):
        u = min(1.0, max(0.0, u))
        return u * u * (3 - 2 * u)

    def stats(fr):
        f = fr.astype(np.float32)
        y = (f * LUMA).sum(-1)
        lo, hi = y <= np.percentile(y, 2), y >= np.percentile(y, 99.5)
        return dict(luma_mean=round(float(y.mean()), 1), luma_p2=round(float(np.percentile(y, 2)), 1),
                    luma_p98=round(float(np.percentile(y, 98)), 1),
                    shadow_rgb=[round(float(f[..., c][lo].mean()), 1) for c in range(3)],
                    highlight_rgb=[round(float(f[..., c][hi].mean()), 1) for c in range(3)],
                    rgb_mean=[round(float(f[..., c].mean()), 1) for c in range(3)])

    cfg = json.load(open(a.config))
    only = set(a.only or [])
    log_dir = a.log_dir or os.path.join(cfg["out_dir"], "grade-logs")
    os.makedirs(log_dir, exist_ok=True)
    os.makedirs(cfg["out_dir"], exist_ok=True)
    for p in cfg["plates"]:
        if only and p["id"] not in only:
            continue
        src = os.path.join(cfg["plate_dir"], p["plate"])
        s0, s1 = p["src"]
        clip = decode(src, s0, s1, p.get("hflip", False))
        n, h, w = clip.shape[:3]
        fps = a.src_fps
        nb_auto = nb_key = 0
        tracked = [track_box(clip, s0, fps, b) for b in p.get("blur_track", [])]
        for k in range(n):
            t = (s0 + k) / fps
            for b in p.get("blur", []):
                box = interp_box(b["keys"], t)
                if box is not None:
                    nb_key += blur_region(clip[k], box, b.get("sigma", 7))
            for b, boxes in zip(p.get("blur_track", []), tracked):
                if boxes[k] is not None:
                    nb_key += blur_region(clip[k], boxes[k], b.get("sigma", 7))
            if p.get("auto_yellow", True):
                for box in yellow_plate_boxes(clip[k]):
                    if p.get("yellow_zone"):
                        zx0, zy0, zx1, zy1 = p["yellow_zone"]
                        cx, cy = (box[0] + box[2]) / 2 / w, (box[1] + box[3]) / 2 / h
                        if not (zx0 <= cx <= zx1 and zy0 <= cy <= zy1):
                            continue
                    nb_auto += blur_region(clip[k], box, 6, 3)
            if p.get("white_zone"):
                for box in white_plate_boxes(clip[k], p["white_zone"]):
                    nb_auto += blur_region(clip[k], box, 6, 3)
        native_sigma = float(np.median([noise_sigma(cv2.cvtColor(clip[k], cv2.COLOR_RGB2GRAY))
                                        for k in range(0, n, max(1, n // 8))]))
        before = stats(clip[n // 2])
        g = p["grade"]
        floor, hi = np.array(g["floor"], np.float32), np.array(g["hi"], np.float32)
        samp = np.stack([cv2.resize(clip[k], (192, int(192 * h / w)), interpolation=cv2.INTER_AREA)
                         for k in range(0, n, 2)]).astype(np.float32)
        bp = float(np.percentile(samp.min(-1), g.get("black_pct", 0.3)))
        wp = float(np.percentile(samp.max(-1), g.get("white_pct", 99.7)))
        n01 = np.clip((samp - bp) / max(1.0, wp - bp), 0, 1)
        gam, ex = solve_tone(n01, floor, hi, g["target_luma"])
        gam_end, ex_end = solve_tone(n01, floor, hi, g["target_luma_end"]) if g.get("target_luma_end") else (gam, ex)
        tail = g.get("tail")
        W, H = (1920, 1080) if w > h else (1080, 1920)
        screen = None
        if p.get("screen"):
            sys.path.insert(0, HERE)
            import screen_comp
            screen = screen_comp.ScreenComp(p["screen"], clip)

        def graded(k):
            u = k / max(1, n - 1)
            r = ease((u - g.get("ramp_from", 0.0)) / max(1e-6, 1 - g.get("ramp_from", 0.0)))
            ga = gam + (gam_end - gam) * r
            e = ex * (ex_end / ex) ** r
            x = np.clip((clip[k].astype(np.float32) - bp) / max(1.0, wp - bp), 0, 1)
            y = tone(x, floor, hi, ga, e)
            if tail and k >= n - tail["frames"]:
                tt = ease((k - (n - tail["frames"]) + 1) / tail["frames"]) * tail.get("amount", 1.0)
                m = y.reshape(-1, 3).mean(0)
                if tail.get("mode") == "offset":
                    y = y + (np.array(tail["rgb"], np.float32) - m) * tt
                else:
                    gain = np.array(tail["rgb"], np.float32) / np.maximum(m, 1)
                    y = y * (1 - tt) + (y * gain) * tt
            return y

        probe = cv2.resize(np.clip(graded(n // 2), 0, 255).astype(np.uint8), (W, H), interpolation=cv2.INTER_LANCZOS4)
        out_sigma0 = noise_sigma(cv2.cvtColor(probe, cv2.COLOR_RGB2GRAY))
        target = p.get("grain_target") or native_sigma
        add = max(float(np.sqrt(max(0.0, target ** 2 - out_sigma0 ** 2))), p.get("grain_min", 1.2))
        out = os.path.join(cfg["out_dir"], f"MADE-{p['id']}-graded.mp4")
        comment = cfg.get("comment", "MADE: AI-generated plate, graded; any screen content is a real capture")
        enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                                "-r", str(a.out_fps), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", str(a.crf),
                                "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709",
                                "-colorspace", "bt709", "-movflags", "+faststart", "-metadata", f"comment={comment}", out],
                               stdin=subprocess.PIPE)
        rng = np.random.default_rng(zlib.crc32(p["id"].encode()))
        first = mid = last = None
        for k in range(n):
            y = graded(k)
            if screen is not None:
                y = screen.apply(k, y)
            up = cv2.resize(np.clip(y, 0, 255).astype(np.float32), (W, H), interpolation=cv2.INTER_LANCZOS4)
            lum = (up * LUMA).sum(-1, keepdims=True) / 255.0
            wgt = np.clip(4 * lum * (1 - lum), 0.35, 1.0)
            gr = cv2.GaussianBlur(rng.normal(0, 1, (H, W)).astype(np.float32), (0, 0), 0.6)[..., None]
            gr *= add / max(1e-6, float(gr.std()))
            ch = cv2.resize(rng.normal(0, 0.3 * add, (H // 2, W // 2, 3)).astype(np.float32), (W, H))
            fr = np.clip(up + gr * wgt + ch * wgt, 0, 255).astype(np.uint8)
            enc.stdin.write(fr.tobytes())
            if k == 0:
                first = fr
            if k == n // 2:
                mid = fr
            last = fr
        enc.stdin.close()
        enc.wait()
        if cfg.get("stills_dir"):
            os.makedirs(cfg["stills_dir"], exist_ok=True)
            for tag, fr in (("first", first), ("mid", mid), ("last", last)):
                cv2.imwrite(os.path.join(cfg["stills_dir"], f"{p['id']}-{tag}.jpg"), cv2.cvtColor(fr, cv2.COLOR_RGB2BGR),
                            [cv2.IMWRITE_JPEG_QUALITY, 92])
        rec = dict(id=p["id"], plate=p["plate"], src_frames=[s0, s0 + n - 1], frames_out=n,
                   seconds_out=round(n / a.out_fps, 3), speed=round(a.out_fps / a.src_fps, 4),
                   target=dict(floor=g["floor"], hi=g["hi"], luma=g["target_luma"], luma_end=g.get("target_luma_end")),
                   black_white_points=[round(bp, 1), round(wp, 1)], gamma=[round(gam, 3), round(gam_end, 3)],
                   exposure=[round(ex, 3), round(ex_end, 3)], plate_mid=before, graded_mid=stats(mid),
                   noise=dict(plate_native=round(native_sigma, 2), upscaled_no_grain=round(out_sigma0, 2),
                              grain_added=round(add, 2),
                              final=round(noise_sigma(cv2.cvtColor(mid, cv2.COLOR_RGB2GRAY)), 2)),
                   blur=dict(auto_boxes=nb_auto, keyed_boxes=nb_key),
                   screen=(screen.log if screen is not None else None), out=out)
        json.dump(rec, open(os.path.join(log_dir, p["id"] + ".json"), "w"), indent=1, default=float)
        print(json.dumps({k: rec[k] for k in ("id", "seconds_out", "gamma", "exposure", "noise", "blur")}), flush=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    ap.add_argument("config", help="plates.json")
    ap.add_argument("--only", nargs="*", help="plate ids to process (default all)")
    ap.add_argument("--log-dir", help="where per-plate JSON logs go (default <out_dir>/grade-logs)")
    ap.add_argument("--src-fps", type=float, default=24.0, help="source plate rate (Seedance: 24)")
    ap.add_argument("--out-fps", type=float, default=30.0, help="output rate; frames are never repeated")
    ap.add_argument("--crf", type=int, default=14)
    run(ap.parse_args())


if __name__ == "__main__":
    main()
