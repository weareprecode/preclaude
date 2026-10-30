#!/usr/bin/env python3
"""Beat grid for cutting to music: measure tempo and downbeat, list bar frames, snap planned cuts to the grid.

  beat_grid.py analyse <track.wav|mp3> [--fps 30] [--min 70] [--max 180] [--beats-per-bar 4] [--bars]
      Coarse tempo from onset-strength autocorrelation summed over lags 1 to 4 beats (long lags catch a tempo that is
      slightly off), then a fine search (0.01 BPM, +/- 1.5 around the coarse value) that also finds the beat phase.
      Prints BPM, half and double candidates, first beat, frames per beat and per bar, and with --bars the per-bar
      energy (all and low band) so you can map the sections (build, lift, breakdown, loudest stretch, outro).
      CHECK the result against the bar phrasing by ear: one track read 118.65 BPM and was really 120.000, and
      every cut and splice drifted off the downbeats.

  beat_grid.py grid --bpm 111 --first-beat 0.139 [--fps 30] [--beats-per-bar 4] [--bars 40] [--unit bar|beat]
      Frame of each bar (or beat) computed as round((first_beat + n * period) * fps). Never add up rounded beat
      lengths: the error accumulates (111 BPM at 30 fps is 16.216 frames a beat).

  beat_grid.py snap --bpm 133.33 --first-beat 0.29 --times 3.9,7.5,11.1 [--fps 30] [--unit bar|beat|half]
      Moves each planned cut to the nearest grid line and reports the shift.

Cutting rules that went with this (Oct 2026 films): lock the music BEFORE the edit (a late music decision forced a
full re-cut); one grid per film family; put the loudest moment on the clearest proof; splice music only on bar lines
(30 ms equal-power crossfade, check RMS matches within 1 dB), never a fade-made ending: end on the track's own hit;
land the last logo letter on a beat.
Needs numpy; ffmpeg on PATH.
"""
import argparse
import json
import math
import subprocess
import sys

SR = 11025


def pcm(path, extra=()):
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, *extra, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def onset(x, hop, np):
    n = len(x) // hop
    e = np.array([float((x[i * hop:(i + 1) * hop] ** 2).sum()) for i in range(n)])
    le = np.log(1e-9 + e)
    return np.maximum(0, np.diff(le, prepend=le[0]))


def analyse(a):
    try:
        import numpy as np
    except ImportError:
        sys.exit("needs numpy")
    x = pcm(a.track)
    dur = len(x) / SR
    HOP = 512
    o = onset(x, HOP, np)
    o = o - o.mean()
    rate = SR / HOP
    scores = []
    for bpm in np.arange(a.min, a.max + 1e-9, 0.25):
        lag = 60 / bpm * rate
        s = 0.0
        for k in range(1, 5):
            L = lag * k
            l0 = int(L)
            f = L - l0
            if l0 + 1 >= len(o):
                break
            s += float((o[:-l0 - 1] * (o[l0:-1] * (1 - f) + o[l0 + 1:] * f)).sum()) / k
        scores.append((float(bpm), s))
    scores.sort(key=lambda t: -t[1])
    coarse = scores[0][0]
    HOP2 = 128
    on = onset(x, HOP2, np)
    r2 = SR / HOP2
    best = (-1.0, coarse, 0.0)
    for bpm in np.arange(coarse - 1.5, coarse + 1.5 + 1e-9, 0.01):
        P = 60 / bpm * r2
        for ph in np.arange(0, P, 1.0):
            idx = np.round(np.arange(ph, len(on) - 1, P)).astype(int)
            idx = idx[(idx > 0) & (idx < len(on) - 1)]
            if len(idx) == 0:
                continue
            s = float((on[idx - 1] + on[idx] + on[idx + 1]).mean())
            if s > best[0]:
                best = (s, float(bpm), float(ph))
    bpm, t0 = best[1], best[2] / r2
    beat = 60 / bpm
    bar = beat * a.beats_per_bar
    res = dict(file=a.track, duration_s=round(dur, 2), bpm=round(bpm, 2), coarse_bpm=coarse,
               coarse_candidates=[round(b, 2) for b, _ in scores[:5]],
               half_double=[round(bpm / 2, 2), round(bpm * 2, 2)], first_beat_s=round(t0, 3), beat_s=round(beat, 4),
               bar_s=round(bar, 4), frames_per_beat=round(a.fps * beat, 3), frames_per_bar=round(a.fps * bar, 3),
               note="confirm the downbeat and tempo by ear against the phrasing before cutting")
    print(json.dumps(res, indent=1))
    if a.bars:
        lo = pcm(a.track, ["-af", "lowpass=f=150"])

        def db(s0, s1, arr):
            seg = arr[int(s0 * SR):int(min(len(arr), s1 * SR))]
            return 10 * math.log10(float((seg ** 2).mean()) + 1e-12) if len(seg) else -120.0
        b = 0
        while t0 + b * bar < dur:
            s0 = t0 + b * bar
            d_all, d_lo = db(s0, s0 + bar, x), db(s0, s0 + bar, lo)
            print(f"{b + 1:4d} {s0:8.2f}s f{int(round(s0 * a.fps)):6d}  all {d_all:6.1f}  low {d_lo:6.1f}  "
                  + "#" * max(0, int(round((d_all + 40) / 1.2))))
            b += 1


def period(a):
    beat = 60 / a.bpm
    return {"beat": beat, "half": beat * a.beats_per_bar / 2, "bar": beat * a.beats_per_bar}[a.unit]


def grid(a):
    p = period(a)
    rows = []
    n = 0
    while n < a.bars * (a.beats_per_bar if a.unit == "beat" else 2 if a.unit == "half" else 1):
        t = a.first_beat + n * p
        rows.append(dict(n=n + 1, t_s=round(t, 4), frame=int(round(t * a.fps))))
        n += 1
    for r in rows:
        print(f"{a.unit} {r['n']:4d}  {r['t_s']:9.4f}s  frame {r['frame']}")


def snap(a):
    p = period(a)
    out = []
    for s in a.times.split(","):
        t = float(s)
        n = round((t - a.first_beat) / p)
        ts = a.first_beat + n * p
        out.append(dict(planned_s=t, snapped_s=round(ts, 4), frame=int(round(ts * a.fps)), shift_ms=round((ts - t) * 1000)))
    print(json.dumps(out, indent=1))


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    sub = ap.add_subparsers(dest="cmd", required=True)
    an = sub.add_parser("analyse")
    an.add_argument("track")
    an.add_argument("--fps", type=float, default=30.0)
    an.add_argument("--min", type=float, default=70.0)
    an.add_argument("--max", type=float, default=180.0)
    an.add_argument("--beats-per-bar", type=int, default=4)
    an.add_argument("--bars", action="store_true", help="print per-bar energy")
    for name in ("grid", "snap"):
        p = sub.add_parser(name)
        p.add_argument("--bpm", type=float, required=True)
        p.add_argument("--first-beat", type=float, required=True, help="first downbeat in seconds")
        p.add_argument("--fps", type=float, default=30.0)
        p.add_argument("--beats-per-bar", type=int, default=4)
        p.add_argument("--unit", choices=["bar", "half", "beat"], default="bar")
        if name == "grid":
            p.add_argument("--bars", type=int, default=40)
        else:
            p.add_argument("--times", required=True, help="planned cut times in seconds, comma-separated")
    a = ap.parse_args()
    {"analyse": analyse, "grid": grid, "snap": snap}[a.cmd](a)


if __name__ == "__main__":
    main()
