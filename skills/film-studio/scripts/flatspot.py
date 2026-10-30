#!/usr/bin/env python3
"""Motion measure and flat-spot map for a finished cut: does the film ever sit still for too long?

Two steps:

  flatspot.py measure <film.mp4> <frames.csv>
      Decodes every frame (greyscale, 320 wide for landscape, 180 wide for portrait) and writes per frame:
        mad      mean absolute luma difference to the previous frame (0-255)
        active   share of pixels whose luma changed by more than 6 levels (0-1)
        flow_px  mean Farneback optical-flow magnitude, px per frame at analysis width
        flow_pct flow as % of frame width per second (resolution independent)
        luma     mean luma

  flatspot.py analyse <frames.csv> <out_dir> [--segments segs.json | --cuts 3.9,7.5,...] [--rest 50.7-60]
                      [--max-flat 6] [--chart] [--strict]
      Classifies every second and finds flat runs. Writes out_dir/flat-spot-map.csv, per-second.csv, film-stats.json
      and (with --chart, if matplotlib is installed) flat-spot.png.

Definitions (fixed before looking at any insert; generated-scenes editor, Oct 2026):
  per-second flow   = median over the second's frames of flow_pct
  per-second active = mean over the second's frames of active, in %
  LOW second        = flow < 1.0 AND active < 5.0   (below the quietest live-action plate we held: flow 1.1, active 4.2 %)
  MID second        = not LOW and flow < 3.0 AND active < 12.0
  HIGH second       = everything else
  flat run          = consecutive LOW seconds. A cut does NOT break it (the strict reading: a cut between two still
                      cards is still a still film). The "eventful" reading (split at cuts and in-shot changes) is
                      reported alongside as longest_unbroken_non_rest_s.
  rest              = seconds inside segments marked as deliberate rests (end cards, title holds) do not count.
  The 6 s rule: no non-rest flat run longer than --max-flat seconds (default 6). --strict exits 1 if any run breaks it.

Segments JSON (optional, gives cut positions, labels and rests):
  [{"id": "S01", "start": 0.0, "end": 3.9, "cap": "caption text", "rest": false}, ...]   (seconds)

Needs numpy and opencv-python for `measure`; numpy for `analyse`; matplotlib only for --chart. ffmpeg/ffprobe on PATH.
"""
import argparse
import csv
import json
import os
import subprocess
import sys

LOW_FLOW, LOW_ACT = 1.0, 5.0
MID_FLOW, MID_ACT = 3.0, 12.0


def need(mods):
    out = []
    for m in mods:
        try:
            out.append(__import__(m))
        except ImportError:
            sys.exit(f"this step needs the Python module '{m}' (pip install {'opencv-python' if m == 'cv2' else m})")
    return out


def measure(src, out):
    cv2, np = need(["cv2", "numpy"])
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries",
                            "stream=width,height,r_frame_rate", "-of", "csv=p=0", src],
                           capture_output=True, text=True, check=True).stdout.strip().split(",")
    w, h = int(probe[0]), int(probe[1])
    num, den = probe[2].split("/")
    fps = float(num) / float(den)
    aw = 320 if w >= h else 180
    ah = int(round(h * aw / w / 2) * 2)
    proc = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-vf", f"scale={aw}:{ah}:flags=area",
                             "-pix_fmt", "gray", "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
    size, prev, rows, t = aw * ah, None, [], 0
    while True:
        buf = proc.stdout.read(size)
        if len(buf) < size:
            break
        cur = np.frombuffer(buf, np.uint8).reshape(ah, aw)
        if prev is None:
            rows.append((t, 0.0, 0.0, 0.0, 0.0, float(cur.mean())))
        else:
            d = np.abs(cur.astype(np.int16) - prev.astype(np.int16))
            fl = cv2.calcOpticalFlowFarneback(prev, cur, None, 0.5, 3, 15, 3, 5, 1.2, 0)
            mag = float(np.sqrt((fl ** 2).sum(axis=2)).mean())
            rows.append((t, float(d.mean()), float((d > 6).mean()), mag, mag * fps / aw * 100.0, float(cur.mean())))
        prev, t = cur, t + 1
    proc.wait()
    with open(out, "w", newline="") as f:
        wr = csv.writer(f)
        wr.writerow(["frame", "t_s", "mad", "active", "flow_px", "flow_pct_w_per_s", "luma", "fps"])
        for r in rows:
            wr.writerow([r[0], f"{r[0] / fps:.4f}", f"{r[1]:.4f}", f"{r[2]:.5f}", f"{r[3]:.5f}", f"{r[4]:.3f}",
                         f"{r[5]:.2f}", f"{fps:.4f}"])
    print(f"{src}: {len(rows)} frames at {aw}x{ah}, {fps:.3f} fps -> {out}")


def tc(sec, fps):
    f = int(round(sec * fps))
    fi = int(round(fps))
    return f"{f // (60 * fi):02d}:{(f // fi) % 60:02d}:{f % fi:02d}"


def load_segments(a, dur):
    if a.segments:
        segs = json.load(open(a.segments))
        for s in segs:
            s.setdefault("cap", "")
            s.setdefault("rest", False)
        return segs
    cuts = [float(x) for x in a.cuts.split(",") if x.strip()] if a.cuts else []
    edges = [0.0] + sorted(cuts) + [dur]
    segs = [dict(id=f"S{i + 1:02d}", start=edges[i], end=edges[i + 1], cap="", rest=False) for i in range(len(edges) - 1)]
    for r in a.rest or []:
        r0, r1 = (float(x) for x in r.split("-"))
        segs = [s for s in segs]
        for s in segs:
            if s["start"] >= r0 - 1e-6 and s["end"] <= r1 + 1e-6:
                s["rest"] = True
        if not any(s["rest"] and abs(s["start"] - r0) < 1e-6 for s in segs):
            # rest range not on a cut: split it out as its own segment
            out = []
            for s in segs:
                if s["start"] < r0 < s["end"]:
                    out += [dict(s, end=r0), dict(s, id=s["id"] + "r", start=r0, rest=True)]
                else:
                    out.append(s)
            segs = out
    return segs


def seg_at(segs, t):
    for s in segs:
        if s["start"] <= t < s["end"]:
            return s
    return segs[-1]


def analyse(a):
    (np,) = need(["numpy"])
    r = list(csv.DictReader(open(a.frames)))
    if not r:
        sys.exit("empty frames CSV")
    fps = float(r[0].get("fps") or a.fps)
    mad = np.array([float(x["mad"]) for x in r])
    act = np.array([float(x["active"]) for x in r])
    fl = np.array([float(x["flow_pct_w_per_s"]) for x in r])
    n = len(mad)
    dur = n / fps
    segs = load_segments(a, dur)
    cuts = [s["start"] for s in segs[1:]]
    cuts_f = [int(round(c * fps)) for c in cuts]
    ev_f = []
    for i in range(2, n):  # in-shot changes: one-frame luma jumps well above the local median that are not cuts
        loc = np.median(mad[max(1, i - 7):i + 8])
        if mad[i] > 2.5 and mad[i] > 4 * max(loc, 0.05) and all(abs(i - c) > 3 for c in cuts_f):
            if not ev_f or i - ev_f[-1] > 6:
                ev_f.append(i)
    F = int(round(fps))
    nsec = int(np.ceil(n / F))
    sec_flow, sec_act, tier, persec = [], [], [], []
    for s in range(nsec):
        lo, hi = max(1, s * F), min(n, (s + 1) * F)
        f_ = float(np.median(fl[lo:hi])) if hi > lo else 0.0
        ac = float(np.mean(act[lo:hi]) * 100) if hi > lo else 0.0
        t = "LOW" if (f_ < LOW_FLOW and ac < LOW_ACT) else ("MID" if (f_ < MID_FLOW and ac < MID_ACT) else "HIGH")
        sec_flow.append(f_)
        sec_act.append(ac)
        tier.append(t)
        persec.append([s, tc(s, fps), f"{f_:.2f}", f"{ac:.2f}", t, seg_at(segs, s + 0.5)["id"]])
    runs, s = [], 0
    while s < nsec:
        if tier[s] == "LOW":
            e = s
            while e + 1 < nsec and tier[e + 1] == "LOW":
                e += 1
            runs.append((s, e + 1))
            s = e + 1
        else:
            s += 1
    flats, k = [], 0
    for r0, r1 in runs:
        if r1 - r0 < 3:
            continue
        k += 1
        breaks = sorted([c for c in cuts if r0 < c < r1] + [e / fps for e in ev_f if r0 < e / fps < r1])
        nonrest = sum(1 for t in range(r0, r1) if not seg_at(segs, t + 0.5)["rest"])
        rest_start = min([sg["start"] for sg in segs if sg["rest"] and sg["end"] > r0] + [r1])
        nb = min(r1, max(r0, rest_start))
        pieces, p = [], r0
        for x in [y for y in breaks if y < nb] + [nb]:
            pieces.append(x - p)
            p = x
        longest = max(pieces) if nonrest else 0.0
        status = ("rest" if nonrest == 0 else "over_limit" if nonrest > a.max_flat
                  else "3s_to_limit" if nonrest >= 3 else "short_tail_into_rest")
        caps = " | ".join(dict.fromkeys(seg_at(segs, t + 0.5)["cap"] for t in range(r0, r1) if seg_at(segs, t + 0.5)["cap"]))
        flats.append([f"F{k:02d}", tc(r0, fps), tc(r1, fps), r0, r1, r1 - r0, nonrest, round(longest, 2),
                      len([c for c in cuts if r0 < c < r1]), " ".join(sg["id"] for sg in segs if sg["end"] > r0 and sg["start"] < r1),
                      f"{np.mean(sec_flow[r0:r1]):.2f}", f"{np.mean(sec_act[r0:r1]):.2f}", status, caps])
    shots = np.array([sg["end"] - sg["start"] for sg in segs])
    content = np.array([sg["end"] - sg["start"] for sg in segs if not sg["rest"]] or [0.0])
    low_nr = sum(1 for i, t in enumerate(tier) if t == "LOW" and not seg_at(segs, i + 0.5)["rest"])
    nr = sum(1 for i in range(nsec) if not seg_at(segs, i + 0.5)["rest"])
    over = [f for f in flats if f[12] == "over_limit"]
    stats = dict(file=a.frames, duration_s=round(dur, 2), fps=fps, shots=len(segs),
                 cuts_per_min=round(len(cuts) / dur * 60, 1), asl_s=round(float(shots.mean()), 2),
                 median_shot_s=round(float(np.median(shots)), 2), asl_excl_rest_s=round(float(content.mean()), 2),
                 longest_shot_s=round(float(shots.max()), 2), in_shot_events=len(ev_f),
                 visual_changes_per_min=round((len(cuts) + len(ev_f)) / dur * 60, 1),
                 low_share_pct=round(100 * tier.count("LOW") / nsec, 1),
                 low_share_excl_rest_pct=round(100 * low_nr / max(1, nr), 1),
                 median_flow=round(float(np.median(sec_flow)), 2), max_flat_s=a.max_flat,
                 runs_over_limit=len(over), tiers={t: tier.count(t) for t in ("LOW", "MID", "HIGH")},
                 verdict="PASS" if not over else "FAIL")
    os.makedirs(a.out_dir, exist_ok=True)
    with open(os.path.join(a.out_dir, "flat-spot-map.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["flat_id", "in_tc", "out_tc", "in_s", "out_s", "dur_s", "non_rest_s", "longest_unbroken_non_rest_s",
                    "cuts_inside", "segments", "mean_flow_pct_w_per_s", "mean_active_pct", "status", "captions_on_screen"])
        w.writerows(flats)
    with open(os.path.join(a.out_dir, "per-second.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["second", "tc", "flow_pct_w_per_s", "active_pct", "tier", "segment"])
        w.writerows(persec)
    json.dump(stats, open(os.path.join(a.out_dir, "film-stats.json"), "w"), indent=1)
    print(json.dumps(stats, indent=1))
    for fr in flats:
        print("  ", fr[:8], fr[12], fr[13][:80])
    if a.chart:
        chart(a, segs, sec_flow, sec_act, tier, flats, shots, ev_f, fps, np)
    if a.strict and over:
        sys.exit(1)


def chart(a, segs, flow, act, tier, flats, shots, ev_f, fps, np):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib not installed: chart skipped")
        return
    fig = plt.figure(figsize=(16, 7))
    gs = fig.add_gridspec(3, 2, height_ratios=[3, 1.6, 1.6], hspace=0.6)
    ax, ax2 = fig.add_subplot(gs[0, :]), fig.add_subplot(gs[1, :])
    ax3, ax4 = fig.add_subplot(gs[2, 0]), fig.add_subplot(gs[2, 1])
    x = np.arange(len(flow)) + 0.5
    cap = 20.0
    for sg in segs:
        if sg["rest"]:
            for a_ in (ax, ax2):
                a_.axvspan(sg["start"], sg["end"], color="0.8", alpha=0.5, lw=0)
    for r in flats:
        if r[6] > 0:
            for a_ in (ax, ax2):
                a_.axvspan(r[3], r[4], color="#eb6834", alpha=0.18, lw=0)
            ax.text((r[3] + r[4]) / 2, cap * 0.93, f"{r[6]} s", ha="center", va="top", fontsize=9, fontweight="bold")
    col = ["#eb6834" if t == "LOW" else "#2a78d6" for t in tier]
    ax.bar(x, np.minimum(flow, cap), width=0.82, color=col)
    ax.axhline(LOW_FLOW, color="0.3", lw=0.8, ls=":")
    ax.set_ylim(0, cap)
    ax.set_ylabel("Flow, % width / s")
    ax2.bar(x, act, width=0.82, color=col)
    ax2.axhline(LOW_ACT, color="0.3", lw=0.8, ls=":")
    ax2.set_ylabel("Pixels changing, %")
    for sg in segs[1:]:
        for a_ in (ax, ax2):
            a_.axvline(sg["start"], color="k", lw=0.8, alpha=0.5)
    for e in ev_f:
        ax.plot([e / fps], [cap * 0.02], marker="^", ms=6, color="0.3")
    ax.set_xlim(0, len(flow))
    ax3.hist(shots, bins=np.arange(0, max(16, np.ceil(shots.max()) + 2), 1), rwidth=0.85)
    ax3.set_title(f"{len(shots)} shots, mean {shots.mean():.1f} s", loc="left", fontsize=10)
    ax4.plot(np.linspace(0, 100, len(flow)), np.sort(flow), lw=2)
    ax4.set_ylim(0, cap)
    ax4.set_title(f"{100 * tier.count('LOW') / len(tier):.0f} % of seconds are LOW", loc="left", fontsize=10)
    fig.suptitle(f"Flat-spot map: {os.path.basename(a.frames)} (orange = LOW second, shaded = flat run >= 3 s)", x=0.05,
                 ha="left")
    p = os.path.join(a.out_dir, "flat-spot.png")
    fig.savefig(p, dpi=110)
    print("chart:", p)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    sub = ap.add_subparsers(dest="cmd", required=True)
    m = sub.add_parser("measure", help="per-frame motion CSV from a film")
    m.add_argument("film")
    m.add_argument("out_csv")
    an = sub.add_parser("analyse", help="flat-spot map and 6 s rule from a frames CSV")
    an.add_argument("frames")
    an.add_argument("out_dir")
    an.add_argument("--segments", help="segments JSON (id, start, end, cap, rest) in seconds")
    an.add_argument("--cuts", help="comma-separated cut times in seconds (if no segments JSON)")
    an.add_argument("--rest", action="append", help="deliberate rest range in seconds, e.g. 50.7-60 (repeatable)")
    an.add_argument("--fps", type=float, default=30.0, help="fps if the CSV has no fps column (default 30)")
    an.add_argument("--max-flat", type=float, default=6.0, help="longest allowed non-rest flat run, seconds (default 6)")
    an.add_argument("--chart", action="store_true", help="also write flat-spot.png (needs matplotlib)")
    an.add_argument("--strict", action="store_true", help="exit 1 if any run breaks the limit")
    a = ap.parse_args()
    if a.cmd == "measure":
        measure(a.film, a.out_csv)
    else:
        analyse(a)


if __name__ == "__main__":
    main()
