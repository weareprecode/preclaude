# Capture QA: gates and how to read the verdicts

Every captured take goes through the same gates before it reaches an edit, and the finished master goes through them again. The numbers come from tools, never from looking at a review-size copy: a whole film once shipped to review at a quarter of its true sharpness, and nobody saw it at 720p.

## Before the first frame (in the rig)

`film_rig.mjs` runs these on the browser's own clock, before it takes the clock over:

1. **Prewarm.** Visit every pose the take will show (`prewarm`, `prewarmTimes`, `prewarmHold`). Views first reached under the stepped clock stay at whatever detail is cached.
2. **Refine hold.** Hold the first pose on the real clock (`refineHold`, or `FILM_REFINE_HOLD`). Streamed 3D (photoreal meshes, 3D tiles, splats) kept refining for 15 to 45 s after the page said it had loaded. Use 45 to 75 s for streamed 3D; 0 is fine for flat pages and cards.
3. **Sharpness gate.** `gate: { box, min }`, or `FILM_GATE_BOX` and `FILM_GATE_MIN`. The rig measures the box, saves the still and `gate-<name>.json`, and refuses the attempt if the box is too soft. The next attempt reloads the page. Some loads settle in a bad state, so a refusal is the gate working, not a crash.
4. **Region-state gate** (optional, as a `gate` function or in the take script). Run `region_match.py` on the gate still against a reference still of the plain page. This catches a page that settles into a different but equally sharp state. In one take a tree row drew as bare branches instead of canopy, and two takes swapped state at a dissolve.

### Calibrating the gates
- **Sharpness.** Shoot the plain page with no rig, at the same viewport, DPR and pose, after a 75 s hold. Read the box with `sharpness.py still`, then set `min` at about 80 % of that reading. In Oct 2026 a plain reading of 115 gave a gate of 90; the faulty takes read 29.8.
- **Region state.**
  - Shoot the reference twice, from two fresh loads, and read both with `region_match.py`.
  - Set `--max` above that same-state spread and well under a known-bad reading. Same state read 0.0 to 1.5 MAD; wrong state read 4.4 to 5.7.
- **Boxes.** Use fine fixed detail (a sign, roof text, a facade). Keep them clear of UI, the cursor, clocks, live data and anything that animates.

## After capture: `take_qa.py`

```bash
python3 -I scripts/take_qa.py take.mov --out qa/T1 --cuts 4.2,9.8 \
  --sharp-box 3130 470 3530 770 --sharp-min 45
```

`--sharp-min` here is at scan scale (0.5 by default), so calibrate it with `sharpness.py scan` on a good take rather than reusing the full-size gate number.

It writes `qa.json` (frame QA), `sharpness.json` (per-frame sharpness, dips and low frames), `sheet.jpg` (the whole take), `flags.jpg` (every flagged frame) and `verdict.json`.

| Verdict | Exit | Meaning | What to do |
|---|---|---|---|
| **PASS** | 0 | Nothing left to look at. | Use the take. Keep `verdict.json` in the ledger. |
| **CHECK** | 3 | Flags that are often benign on screen captures but have not been looked at. | Open `flags.jpg`, then step through the frames at 100 % and at speed. Either fix them, or rule them benign with `--allow <frame ranges>` or `--accept <kind>`, re-run, and write the ruling in the ledger. |
| **FAIL** | 1 | A fault with no benign reading. | Patch it (`frame_patch.py`) or retake. Then re-run. |

**FAIL reasons:**
- a flash (A-B-A luma spike) or a near-white frame;
- a 1 to 2 frame glitch;
- a bright tail;
- a 5-phase cadence deviation over 0.25 (a repeat or blend conform);
- a comped screen cleaner than its surround;
- any frame under `--sharp-min`.

**CHECK reasons:**
- repeat-like frames;
- skipped-frame steps;
- luma jumps off a cut;
- a 5-phase deviation of 0.10 to 0.25;
- sharpness dips (a frame under 0.85 of its neighbours).

### Known benign CHECKs
Confirm each one on the frames every time. Never rule on the count alone.
- **Eased glides.** Skip flags of a few pixels where a cursor or the camera eases in or out. One take had 33 sub-3 px flags, all at cursor glides and camera ease starts.
- **Still holds.** Repeat-like frames and "uneven cadence" while nothing on screen moves, such as a UI hold or a reading pause. An "uneven cadence" flag on a whole take turned out to be its still holds, not judder.
- **Intended state changes.** A luma jump where the product switches a basemap, layer or scenario on purpose, or fades to the end card. Pass these times with `--cuts` so they are not flagged at all.
- **UI over the sharpness box.** Dips while a panel opens over the box or the cursor crosses it.

### Never benign
- A flash, or a single black, white or placeholder frame. For example, an "Opening the photo" frame in the middle of a beat.
- A sharpness dip mid-move with nothing crossing the box. That is a detail level dropping, which a forensic judge will find.
- A skip with a still background in the middle of a camera move.
- A take that switches page state at a join or dissolve. Run `region_match.py` across the join.

## One-frame patches: `frame_patch.py`
A take that is right apart from one frame is cheaper and safer to patch than to retake. A retake brings new timing, new streamed detail and new judge work.
- **Whole frame:** `--whole N=M` replaces frame N with frame M. Use it on still shots, where N and M are near identical.
- **Pane:** `--pane N=M:x0,y0,x1,y1` replaces only a box of N, such as a tooltip that blinks in for one frame or a panel thumbnail showing a placeholder. The moving map and the cursor are left untouched, and the log proves nothing outside the box changed.
- It always writes a new sequence and leaves the source alone. Re-encode, then re-run `take_qa.py`. A whole patch on a moving shot reads as a repeat plus a double step (CHECK): look at it at speed before you allow it.

## Contact sheets
`take_qa.py` writes `sheet.jpg` and `flags.jpg`. For forensics, use `contact_sheet.py --frames ... --crop ... --zoom 3` to step through a region at 100 to 300 %.
