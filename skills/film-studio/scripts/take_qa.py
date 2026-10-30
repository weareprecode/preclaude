#!/usr/bin/env python3
"""One QA verdict for a captured take (or a finished master): PASS, CHECK or FAIL, with the evidence on disk.

Runs, into --out:
  qa.json          frame_qa.py: repeats, skipped frames, 5-phase cadence, flicker, flashes, near-white frames, luma
                   jumps off cuts, 1-2 frame glitches, dark tail
  sharpness.json   sharpness.py scan over --sharp-box (only with --sharp-box): low frames and dips
  sheet.jpg        contact sheet of the whole take (16 frames, time and frame stamped)
  flags.jpg        contact sheet of the flagged frames (up to 24), to look at before ruling
  verdict.json     the verdict, every reason, and the frames still to look at

Usage:
  take_qa.py <video> --out DIR [--cuts 3.9,7.5] [--tail 0] [--sharp-box x0 y0 x1 y1 --sharp-min 90 [--dip 0.85]]
             [--allow 98-109,925] [--accept cadence,repeats] [--no-skips] [--no-sheets]

Verdict:
  FAIL   a fault with no benign reading: flash, near-white frame, 1-2 frame glitch, bright tail, a 5-phase deviation
         over 0.25 (repeat or blend conform), a comped screen cleaner than its surround, or a frame under --sharp-min.
         Fix it (one-frame patch with frame_patch.py, or retake) and re-run.
  CHECK  flags that are often benign on screen captures but must be looked at: repeat-like frames, skipped-frame
         steps, luma jumps off a cut, a 5-phase deviation of 0.10 to 0.25, sharpness dips. Open flags.jpg (and the
         frames themselves at 100 %), then either fix them or rule them benign with --allow (frame ranges) or
         --accept (whole kinds: repeats, skips, jumps, cadence, dips) and re-run. Write the ruling in the run ledger.
  PASS   nothing left to look at.
Exit codes: 0 PASS, 3 CHECK, 1 FAIL (2 is a usage error).

Known benign CHECKs (Oct 2026 takes; confirm on the frames every time, never by count alone):
  - eased glides: skip flags of a few pixels where a cursor or camera eases in or out (33 sub-3 px flags in one take).
  - still holds: repeat-like frames and "uneven cadence" while nothing on screen moves (a UI hold, a reading pause).
  - intended state changes: a luma jump where the product switches a basemap, a layer or a scenario on purpose, and
    fades into an end card. Better: pass the time with --cuts so frame_qa.py does not flag it at all.
  - sharpness dips at UI events (a panel opening over the box, a cursor crossing it).
Not benign, whatever the count: a flash, a one-frame black or placeholder frame, a dip mid-move with nothing crossing
the box (a detail level dropping), a skip with a still background mid-move.
Needs numpy and opencv-python; ffmpeg and ffprobe on PATH. Runs its sibling scripts with this interpreter.
"""
import argparse
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def ranges(spec):
    out = []
    for part in filter(None, (spec or "").split(",")):
        a, _, b = part.strip().partition("-")
        out.append((int(a), int(b or a)))
    return out


def allowed(frame, rs):
    return any(a <= frame <= b for a, b in rs)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter,
                                 epilog=__doc__.split("\n", 2)[2])
    ap.add_argument("video")
    ap.add_argument("--out", required=True, help="folder for the QA files")
    ap.add_argument("--cuts", help="cut or intended-change times in seconds, comma-separated (passed to frame_qa.py)")
    ap.add_argument("--tail", type=float, default=0.0, help="dark-tail check seconds (default 0: takes have no end card)")
    ap.add_argument("--sharp-box", nargs=4, type=int, metavar=("X0", "Y0", "X1", "Y1"))
    ap.add_argument("--sharp-min", type=float, default=0.0, help="FAIL on any frame below this (scan scale)")
    ap.add_argument("--sharp-scale", type=float, default=0.5)
    ap.add_argument("--dip", type=float, default=0.85)
    ap.add_argument("--allow", help="frame ranges reviewed and ruled benign, e.g. 98-109,925")
    ap.add_argument("--accept", default="", help="kinds ruled benign for the whole take: repeats,skips,jumps,cadence,dips")
    ap.add_argument("--no-skips", action="store_true", help="skip the optical-flow skipped-frame check (faster)")
    ap.add_argument("--no-sheets", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    allow = ranges(a.allow)
    accept = {k.strip() for k in a.accept.split(",") if k.strip()}
    bad = accept - {"repeats", "skips", "jumps", "cadence", "dips"}
    if bad:
        ap.error(f"unknown --accept kinds: {sorted(bad)}")

    py = [sys.executable, "-I"]
    cmd = py + [os.path.join(HERE, "frame_qa.py"), a.video, "--json", os.path.join(a.out, "qa.json"), "--tail", str(a.tail)]
    if a.cuts:
        cmd += ["--cuts", a.cuts]
    if a.no_skips:
        cmd += ["--no-skips"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode not in (0, 1) or not os.path.exists(os.path.join(a.out, "qa.json")):
        sys.exit(f"frame_qa.py failed: {r.stderr.strip()[-800:]}")
    qa = json.load(open(os.path.join(a.out, "qa.json")))

    fail, check, look = [], [], set()
    fail += qa.get("fail_reasons", [])
    for kind, f in [("flash", f) for _, f in qa.get("flashes", [])] + [("glitch", f) for _, f in qa.get("glitches", [])] \
            + [("near-white", f) for f in qa.get("near_white_frames", [])]:
        look.add(int(f))

    def soft(kind, frames, total, label):
        if kind in accept or total == 0:
            return
        left = [f for f in frames if not allowed(f, allow)]
        if left or total > len(frames):
            look.update(left[:24])
            check.append(f"{label}: {total} flagged, {len(left) + max(0, total - len(frames))} not yet ruled "
                         f"(e.g. frames {left[:10]})")

    soft("repeats", qa.get("repeat_at", []), qa.get("repeat_frames", 0), "repeat-like frames")
    soft("skips", qa.get("skip_at", []), qa.get("skip_frames", 0), "skipped-frame steps")
    soft("jumps", qa.get("off_cut_jumps", []), len(qa.get("off_cut_jumps", [])), "luma jumps off a cut")
    dev = qa.get("worst_five_phase_dev", 0) or 0
    if 0.10 < dev <= 0.25 and "cadence" not in accept:
        check.append(f"uneven cadence (5-phase dev {dev:.2f}): still holds read this way; confirm, then --accept cadence")

    sharp = None
    if a.sharp_box:
        from sharpness import scan
        sharp = scan(a.video, tuple(a.sharp_box), a.sharp_scale, 0, None, 6, a.dip, a.sharp_min)
        json.dump(sharp, open(os.path.join(a.out, "sharpness.json"), "w"), indent=1)
        if sharp["n_low"]:
            fail.append(f"{sharp['n_low']} frames under sharpness {a.sharp_min} (min {sharp['min_value']}, "
                        f"e.g. frames {[x['frame'] for x in sharp['low'][:10]]})")
            look.update(x["frame"] for x in sharp["low"][:12])
        soft("dips", [d["frame"] for d in sharp["dips"]], sharp["n_dips"], f"sharpness dips under {a.dip} of neighbours")

    verdict = "FAIL" if fail else ("CHECK" if check else "PASS")
    sheets = {}
    if not a.no_sheets:
        cs = os.path.join(HERE, "contact_sheet.py")
        s1 = os.path.join(a.out, "sheet.jpg")
        if subprocess.run(py + [cs, a.video, s1, "--count", "16", "--cols", "4", "--width", "480"],
                          capture_output=True).returncode == 0:
            sheets["sheet"] = s1
        if look:
            s2 = os.path.join(a.out, "flags.jpg")
            fr = ",".join(str(f) for f in sorted(look)[:24])
            if subprocess.run(py + [cs, a.video, s2, "--frames", fr, "--cols", "4", "--width", "480"],
                              capture_output=True).returncode == 0:
                sheets["flags"] = s2
    rep = dict(video=a.video, verdict=verdict, fail=fail, check=check, look_at=sorted(look)[:60],
               allowed=a.allow or None, accepted=sorted(accept) or None, frames=qa.get("frames"), fps=qa.get("fps"),
               frame_qa_verdict=qa.get("verdict"), sharpness=None if not sharp else dict(
                   box=sharp["box"], median=sharp["median"], min=sharp["min_value"], n_dips=sharp["n_dips"],
                   n_low=sharp["n_low"], gate_min=sharp["gate_min"]), files=dict(qa=os.path.join(a.out, "qa.json"),
                   sharpness=os.path.join(a.out, "sharpness.json") if sharp else None, **sheets))
    json.dump(rep, open(os.path.join(a.out, "verdict.json"), "w"), indent=1)
    print(json.dumps(rep, indent=1))
    sys.exit({"PASS": 0, "CHECK": 3, "FAIL": 1}[verdict])


if __name__ == "__main__":
    main()
