#!/usr/bin/env python3
"""Frame-level QA for a clip or a finished master: cadence, repeats, flicker, flashes, glitches, dark ending.

Usage:
  frame_qa.py <video> [--cuts 3.9,7.5,...] [--box x0 y0 x1 y1] [--tail 15] [--tail-max-luma 33]
              [--tsv per-frame.tsv] [--json report.json] [--strict]

What it measures (one decode, greyscale, 640 px wide unless --full):
  repeats      frames whose background difference to the previous frame is under 35 % of the clip median.
               A 24-to-30 fps conform by frame repeat shows one every 5th frame (18 to 22 per 4 s cut).
  skips        the opposite fault, a DROPPED frame: everything that moves jumps about twice its usual step once,
               while the still parts of the picture do not move. Per step, the mean optical-flow magnitude of the
               moving pixels (320 px wide copy; the top 10 %, or every pixel over 0.25 px when only small objects
               move) is divided by the median of the 8 steps around it; a step at or over
               --skip-ratio (default 1.6) is a skip when the static-region guard holds: cells that are still for the
               whole clip (median flow under 0.1 px, 90th percentile under 0.3 px) move no more than usual at that
               step, so camera shake and bumps are not counted. Steps within 2 frames of a cut (--cuts) or with a
               picture change over 4x its neighbours (a cut or glitch) are ignored. With no still region (a moving
               camera) the guard cannot run and skips are reported as unguarded. A repeat check alone passes a plate
               with a drop: Seedance bridge-1 dropped one source frame a second (2x steps at 24, 48, 72) and passed
               every repeat gate until a phase check found it. Skip it with --no-skips (faster on long masters).
  5-phase      background motion per frame divided by its 9-frame running mean, averaged per position in a 5-frame
               cycle. A repeat or blend conform shows one phase far from 1.0. Good: worst deviation under 0.05
               (in-car comps, Oct 2026: 0.015 to 0.048). Bad: 0.25 to 0.99 (v2, repeat and interpolated conforms).
  alternation  mean |d[i] - d[i-1]| / mean d. A period-2 strobe (route line fighting a page animation) scores high.
               Clean capture: about 0.00 to 0.10. Meaningless on near-static cards, so read it on moving shots only.
  flashes      A-B-A luma spikes over 8 levels, and 2 to 3 frame excursions over 10 (red-team gate).
  near_white   frames with mean luma over 235 (a white frame on a dark call screen is a flash).
  jumps        frame-to-frame mean-luma jumps over 15 that do NOT sit within 2 frames of a cut (--cuts).
  glitches     1 to 2 frame inserts: a frame (or pair) unlike both neighbours while the neighbours match each other.
  tail         mean luma over the last --tail seconds must stay at or under --tail-max-luma (dark end card, no stale
               website frame). Skip with --tail 0.
  screen noise with --box (a phone or screen box in pixels): high-pass noise inside the screen against a ring around
               it. A comp whose screen is cleaner than its surround (ratio under about 0.8) is a forensic tell; aim
               for about 1.0. Background difference is then measured with the box masked out.

Verdict: FAIL on flashes, near-white frames, 1-2 frame glitches, a bright tail, a cleaner-than-surround screen or a
5-phase deviation over 0.25; CHECK on repeat-like frames, skips, off-cut luma jumps or a 5-phase deviation of 0.10 to
0.25 (often benign on screen captures: eased glides, still holds, intended state changes; look before ruling); else
PASS. take_qa.py turns this into a take verdict and accepts reviewed frame ranges (references/qa.md).
--strict exits 1 on any FAIL or CHECK reason. Thresholds are the ones used on the Oct 2026 films; tune them with care and
write down why.
Needs numpy and opencv-python; ffmpeg/ffprobe on PATH.
"""
import argparse
import json
import subprocess
import sys


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    ap.add_argument("video")
    ap.add_argument("--cuts", help="comma-separated cut times in seconds (jumps on cuts are allowed)")
    ap.add_argument("--box", nargs=4, type=int, metavar=("X0", "Y0", "X1", "Y1"),
                    help="screen or phone box in source pixels, for screen noise and a masked background")
    ap.add_argument("--tail", type=float, default=15.0, help="seconds at the end that must stay dark (0 to skip)")
    ap.add_argument("--tail-max-luma", type=float, default=33.0, help="max mean luma in the tail (default 33, navy)")
    ap.add_argument("--full", action="store_true", help="analyse at full resolution (slower)")
    ap.add_argument("--skip-ratio", type=float, default=1.6,
                    help="motion step over its neighbours' median that counts as a dropped frame (default 1.6)")
    ap.add_argument("--no-skips", action="store_true", help="do not run the optical-flow skipped-frame check")
    ap.add_argument("--tsv", help="write per-frame measures here")
    ap.add_argument("--json", help="write the summary here")
    ap.add_argument("--strict", action="store_true", help="exit 1 on any gate failure")
    a = ap.parse_args()
    try:
        import cv2
        import numpy as np
    except ImportError:
        sys.exit("needs numpy and opencv-python (pip install numpy opencv-python)")

    pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height,r_frame_rate",
                         "-of", "csv=p=0", a.video], capture_output=True, text=True, check=True).stdout.strip().split(",")
    W, H = int(pr[0]), int(pr[1])
    n_, d_ = pr[2].split("/")
    fps = float(n_) / float(d_)
    aw = W if a.full else min(W, 640)
    ah = int(round(H * aw / W / 2) * 2)
    s = aw / W
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-i", a.video, "-vf", f"scale={aw}:{ah}:flags=area", "-pix_fmt", "gray",
                             "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
    mask_bg = np.ones((ah, aw), bool)
    if a.box:
        x0, y0, x1, y1 = [int(v * s) for v in a.box]
        p = int(30 * s)
        mask_bg[max(0, y0 - p):y1 + p, max(0, x0 - p):x1 + p] = False
        sx0, sx1 = int(x0 + 0.15 * (x1 - x0)), int(x1 - 0.15 * (x1 - x0))
        sy0, sy1 = int(y0 + 0.15 * (y1 - y0)), int(y1 - 0.15 * (y1 - y0))
        ring = np.zeros((ah, aw), bool)
        r = int(80 * s)
        ring[max(0, y0 - r):min(ah, y1 + r), max(0, x0 - r):min(aw, x1 + r)] = True
        ring[max(0, y0 - 10):y1 + 10, max(0, x0 - 10):x1 + 10] = False
    small = []  # 160x90 copies for glitch checks
    luma, bg, scr_n, ring_n = [], [], [], []
    # skipped-frame check: flow on a 320 px wide copy, per-step 90th percentile plus a coarse cell grid of magnitudes
    fw = min(aw, 320)
    fh = max(2, int(round(ah * fw / aw / 2) * 2))
    mask_f = cv2.resize(mask_bg.astype(np.uint8), (fw, fh), interpolation=cv2.INTER_NEAREST).astype(bool)
    motion, cells = [], []
    prev_f = None
    prev = None
    size = aw * ah
    while True:
        buf = proc.stdout.read(size)
        if len(buf) < size:
            break
        g = np.frombuffer(buf, np.uint8).reshape(ah, aw).astype(np.float32)
        luma.append(float(g.mean()))
        small.append(cv2.resize(g, (160, 90), interpolation=cv2.INTER_AREA))
        bg.append(float(np.abs(g - prev)[mask_bg].mean()) if prev is not None else float("nan"))
        if not a.no_skips:
            gf = cv2.resize(g, (fw, fh), interpolation=cv2.INTER_AREA).astype(np.uint8)
            if prev_f is not None:
                fl = cv2.calcOpticalFlowFarneback(prev_f, gf, None, 0.5, 3, 15, 3, 5, 1.2, 0)
                mag = np.sqrt((fl ** 2).sum(-1))[mask_f]
                # mean of the moving pixels: the top 10 % when much of the frame moves, everything over 0.25 px
                # when only small objects move (a 90th percentile alone reads the still background then)
                thr = max(0.25, float(np.percentile(mag, 90)))
                mv = mag[mag >= thr]
                motion.append(float(mv.mean()) if mv.size >= max(20, mag.size // 500) else 0.0)
                mag = np.sqrt((fl ** 2).sum(-1))
                cells.append(cv2.resize(np.where(mask_f, mag, np.nan).astype(np.float32), (32, 18),
                                        interpolation=cv2.INTER_AREA))
            prev_f = gf
        if a.box:
            hp = g - cv2.GaussianBlur(g, (0, 0), 1.5)
            scr_n.append(float(np.std(hp[sy0:sy1, sx0:sx1])))
            ring_n.append(float(np.std(hp[ring])))
        prev = g
    proc.wait()
    n = len(luma)
    if n < 12:
        sys.exit(f"only {n} frames decoded")
    L = np.array(luma)
    B = np.array(bg[1:])
    med = float(np.median(B))
    repeats = [int(i) + 1 for i in np.where(B < 0.35 * med)[0]] if med > 0.05 else []
    run = np.convolve(B, np.ones(9) / 9, "same")
    ratio = (B / np.maximum(run, 1e-6))[4:-4]
    static = med <= 0.05  # a still card has no motion cadence to judge
    phases = [float(ratio[i::5].mean()) for i in range(5)] if (len(ratio) >= 10 and not static) else [1.0] * 5
    worst_phase = max(abs(p - 1) for p in phases)
    alt = float(np.mean(np.abs(np.diff(B))) / (np.mean(B) + 1e-9))
    dl = np.diff(L)
    flashes = []
    for i in range(1, n - 1):
        if abs(L[i] - L[i - 1]) > 8 and abs(L[i] - L[i + 1]) > 8 and np.sign(L[i] - L[i - 1]) == np.sign(L[i] - L[i + 1]):
            flashes.append(("ABA", i))
    for w in (2, 3):
        for i in range(1, n - w):
            base = (L[i - 1] + L[i + w]) / 2
            if abs(L[i - 1] - L[i + w]) < 4 and np.all(np.abs(L[i:i + w] - base) > 10):
                flashes.append((f"{w}-frame", i))
    near_white = [int(i) for i in np.where(L > 235)[0]]
    cuts_f = [int(round(float(c) * fps)) for c in a.cuts.split(",") if c.strip()] if a.cuts else []
    jumps = [int(i) + 1 for i in np.where(np.abs(dl) > 15)[0] if all(abs(int(i) + 1 - c) > 2 for c in cuts_f)]
    glitches = []
    S = small
    def md(x, y):
        return float(np.abs(S[x] - S[y]).mean())
    for i in range(1, n - 1):
        dn = md(i - 1, i + 1)
        if md(i - 1, i) > 6 and md(i, i + 1) > 6 and dn < md(i - 1, i) / 3:
            glitches.append(("1-frame", i))
    for i in range(1, n - 2):
        dn = md(i - 1, i + 2)
        if md(i - 1, i) > 6 and md(i + 1, i + 2) > 6 and md(i, i + 1) < 3 and dn < md(i - 1, i) / 3:
            glitches.append(("2-frame", i))
    skips, skip_info = [], dict(checked=not a.no_skips)
    if not a.no_skips and len(motion) >= 9:
        Mo = np.array(motion)            # Mo[j] = step from frame j to frame j + 1
        Ce = np.stack(cells)             # (steps, 18, 32) flow magnitude per cell, NaN where masked
        with np.errstate(all="ignore"):
            cmed = np.nanmedian(Ce, 0)
            cp90 = np.nanpercentile(Ce, 90, 0)
        still = np.nan_to_num(cmed, nan=9.0) < 0.1
        still &= np.nan_to_num(cp90, nan=9.0) < 0.3
        guarded = still.mean() >= 0.05
        St = np.array([float(np.nanmean(c[still])) for c in Ce]) if guarded else np.zeros(len(Mo))
        st_med = float(np.median(St))
        Bd = np.nan_to_num(np.array(bg, float), nan=0.0)
        for j in range(len(Mo)):
            nb = [Mo[k] for k in range(max(0, j - 4), min(len(Mo), j + 5)) if k != j]
            if len(nb) < 4:
                continue
            ref = float(np.median(nb))
            if ref < 0.15:               # nothing is really moving: no cadence to judge
                continue
            r = Mo[j] / ref
            if r < a.skip_ratio:
                continue
            f = j + 1                    # the frame the jump lands on
            if any(abs(f - c) <= 2 for c in cuts_f):
                continue
            bnb = [Bd[k + 1] for k in range(max(0, j - 4), min(len(Mo), j + 5)) if k != j]
            if Bd[f] > 4 * max(1e-6, float(np.median(bnb))):
                continue                 # a cut or a glitch, reported elsewhere
            if guarded and St[j] > max(0.08, 3 * st_med):
                continue                 # the still region moved too: camera shake, not a drop
            skips.append(dict(frame=f, ratio=round(float(r), 2), step_px=round(float(Mo[j]), 2),
                              still_px=round(float(St[j]), 3) if guarded else None))
        skip_info.update(still_share=round(float(still.mean()), 3), guarded=bool(guarded),
                         motion_median_px=round(float(np.median(Mo)), 3), analysis_width=fw,
                         skip_ratio=a.skip_ratio)
    tail_luma = None
    tail_ok = True
    if a.tail > 0 and n / fps > a.tail:
        tail_luma = float(L[-int(a.tail * fps):].mean())
        tail_ok = tail_luma <= a.tail_max_luma
    noise_ratio = float(np.median(scr_n) / max(1e-6, np.median(ring_n))) if a.box else None
    rep = dict(video=a.video, frames=n, fps=round(fps, 3), size=[W, H], bg_diff_median=round(med, 3),
               repeat_frames=len(repeats), repeat_at=repeats[:60],
               repeat_gaps=(np.diff(repeats).tolist()[:30] if len(repeats) > 2 else []),
               skip_frames=len(skips), skip_at=[s["frame"] for s in skips][:60], skips=skips[:30],
               skip_gaps=(np.diff([s["frame"] for s in skips]).tolist()[:30] if len(skips) > 1 else []),
               skip_check=skip_info,
               five_phase=[round(p, 3) for p in phases], worst_five_phase_dev=round(worst_phase, 3),
               alternation=round(alt, 3), luma_mean=round(float(L.mean()), 1),
               max_luma_jump=round(float(np.abs(dl).max()), 2), flashes=flashes[:40], near_white_frames=near_white[:40],
               off_cut_jumps=jumps[:40], glitches=glitches[:40], tail_mean_luma=None if tail_luma is None else round(tail_luma, 1),
               tail_ok=tail_ok, screen_vs_ring_noise=None if noise_ratio is None else round(noise_ratio, 2))
    # Two tiers. FAIL: faults a viewer sees and that have no benign reading. CHECK: flags that are often benign on
    # screen captures (eased glides, still holds, intended state changes) and must be looked at, frame by frame.
    hard, soft = [], []
    if repeats:
        soft.append(f"{len(repeats)} repeat-like frames")
    if skips:
        soft.append(f"{len(skips)} skipped-frame steps (motion jumps {min(s['ratio'] for s in skips):.1f}x to "
                    f"{max(s['ratio'] for s in skips):.1f}x"
                    + (" with a still background)" if skip_info.get("guarded") else ", unguarded: no still region)"))
    if worst_phase > 0.25:
        hard.append(f"uneven cadence (5-phase dev {worst_phase:.2f}: a repeat or blend conform)")
    elif worst_phase > 0.10:
        soft.append(f"uneven cadence (5-phase dev {worst_phase:.2f})")
    if flashes:
        hard.append(f"{len(flashes)} flashes")
    if near_white:
        hard.append(f"{len(near_white)} near-white frames")
    if jumps:
        soft.append(f"{len(jumps)} luma jumps off a cut")
    if glitches:
        hard.append(f"{len(glitches)} 1-2 frame glitches")
    if not tail_ok:
        hard.append(f"bright tail (mean luma {tail_luma:.1f})")
    if noise_ratio is not None and noise_ratio < 0.8:
        hard.append(f"screen cleaner than surround (noise ratio {noise_ratio:.2f})")
    fails = hard + soft
    rep["fails"] = fails
    rep["fail_reasons"] = hard
    rep["check_reasons"] = soft
    rep["verdict"] = "FAIL" if hard else ("CHECK" if soft else "PASS")
    if a.tsv:
        with open(a.tsv, "w") as f:
            f.write("frame\tt\tluma\tbg_diff\tflow_p90" + ("\tscreen_hp\tring_hp" if a.box else "") + "\n")
            for i in range(n):
                row = [str(i), f"{i / fps:.3f}", f"{L[i]:.2f}", "" if i == 0 else f"{bg[i]:.3f}",
                       "" if (i == 0 or i - 1 >= len(motion)) else f"{motion[i - 1]:.3f}"]
                if a.box:
                    row += [f"{scr_n[i]:.3f}", f"{ring_n[i]:.3f}"]
                f.write("\t".join(row) + "\n")
    if a.json:
        json.dump(rep, open(a.json, "w"), indent=1, default=str)
    print(json.dumps(rep, indent=1, default=str))
    if a.strict and fails:
        sys.exit(1)


if __name__ == "__main__":
    main()
