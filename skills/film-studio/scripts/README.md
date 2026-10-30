# film-studio scripts

Tools harvested from a run of production films made between 16 and 19 Oct 2026 (a day-in-the-life film, an explainer
family, a live globe film, in-car comps and generated scenes). Each one is path-agnostic (CLI arguments only), carries its
usage and the lessons behind it in its header, and runs `--help` without its heavy dependencies installed.
No keys, licence codes, footage or personal data are included.

Dependencies: ffmpeg and ffprobe on PATH for everything. Python 3.9+; most Python tools also need
`numpy` and `opencv-python` (`pip install numpy opencv-python`, plus `matplotlib` for flat-spot charts).
`film_rig.mjs` needs Node 18+ and `playwright-core` with Chrome. `ocr_gate.sh` is macOS only (Apple Vision; builds
`ocr` from `ocr.swift` on first run). `hf_job.py` needs the signed-in `higgsfield` CLI.

| Script | Stage | What it does |
|---|---|---|
| `film_rig.mjs` | Capture | Frame-stepped capture of a live web page or an HTML card on a virtual clock (rAF, performance.now, Date.now and optionally timers replaced), pre-warm, settle stats, resume, 6 retries. Card mode renders `window.render(t)` or paused Web Animations. The cure for strobing route lines and blink blobs. |
| `beat_grid.py` | Edit | Tempo and downbeat from onset autocorrelation (coarse, then fine with phase), per-bar energy for section mapping, bar/beat frame list computed without cumulative rounding, and snapping of planned cuts to the grid. |
| `flatspot.py` | Edit | `measure`: per-frame luma delta, active pixels and optical flow. `analyse`: per-second LOW/MID/HIGH tiers, flat runs, the 6 s rule (strict and eventful readings, rests excluded), shot stats, optional chart. |
| `hf_job.py` | Generate | One Higgsfield job under a hard credit cap: price first, refuse over cap minus reserve, reserve under a file lock, create and download, append to a Markdown log. Refuses reused tags and empty prompts. `--dry-run` prices only. |
| `conform_fix.py` | Generate / comp | `conform`: frame-for-frame retime (24p to 30p plays 1.25x, no repeated frames, frame count checked). `find-repeats` and `fix-repeats`: detect a generator's own near-repeat frames and replace them with flow-interpolated midpoints plus fresh grain. `find-skips` and `fix-skips`: detect dropped frames (2x motion steps with a still background) and insert one midpoint in each. |
| `grade_match.py` | Comp | Config-driven plate pipeline: trim, privacy blur (auto UK yellow/white plate finders, keyed and tracked boxes), grade to the host's black floor, highlight and mean luma (shared black/white point, soft shoulder, clamped gamma plus exposure), optional real-screen comp, Lanczos upscale, matched grain, frame-for-frame conform, tagged encode. |
| `screen_comp.py` | Comp | Puts a real screen capture on a blank screen in a plate: lk / edges / keyframe tracking, true-aspect fit, plate-relative gain and lift, reflections screen-blended back, defocus, occlusion key. Refuses if the glass grows over 2 % (a push into the device). |
| `screen_road_match.py` | Comp | Plate yaw from the vanishing-point patch (minus cabin sway), screen heading from ECC rotation of a heading-up map, then a window search so the screen agrees with the road (RMS <= 3 degrees, max <= 6), avoiding capture ranges already used. |
| `paintout.py` | Fix | Paints out small marks from the same frame only: keyframed masks, row fill along the surface direction, the frame's own grain added back, feathered edge, before/after crop sheet. |
| `ocr_gate.sh` + `ocr.swift` | Judge | Local OCR text gate: every Nth frame native plus every Mth frame as 2x2 tiles upscaled 2x (pinch-zoom view). Exit 1 on any hit. Catches legible plates, liveries and gibberish; also proves your "Made with AI" tag reads. |
| `frame_qa.py` | Judge | Repeat frames, skipped (dropped) frames by optical-flow step against a rolling median with a still-region guard, 5-phase cadence evenness (the 24-to-30 tell), flicker alternation (period-2 strobe), A-B-A flashes, near-white frames, luma jumps off cuts, 1 to 2 frame glitches, dark tail, and screen-vs-surround noise for comps. `--strict` exits 1. |
| `contact_sheet.py` | Judge / review | Time- and frame-stamped sheets: every N seconds for review, N per take for screening, or zoomed crops of chosen frames to step through blur exits and interpolated frames at 100 % to 3x. |
| `blind_reel.py` | Judge | Seeded blind-test reel with the key written first and kept apart, identical treatment for every clip, numbered slates, metadata stripped; scorer against "made marked AI no more than real + 15 points" with a binomial noise band and per-clip reject list. |
| `deliver.py` | Deliver | `master`: send (-14 LUFS, -1 dBTP), call (-24 LUFS) and vertical masters by measured gain plus oversampled limiter, verified. `mux`: re-cut picture with the approved master's audio by stream copy, PCM and packet MD5 proven identical. `review`: 720 px short side at the source aspect (4:5 gives 720x900), two-pass phone review encode under 15 MB; silent masters stay silent. `verify`: loudness, peaks, frames, MD5. |

Suggested order for a film with generated inserts:
storyboard and claims register first, then `film_rig.mjs` captures and `frame_qa.py`, `beat_grid.py` on the locked
music, `hf_job.py` start frames then image-to-video, `contact_sheet.py --count 6` screening, `conform_fix.py
find-skips` and `fix-repeats`, `grade_match.py` (with `screen_comp.py` and `screen_road_match.py` where a real screen is needed),
`ocr_gate.sh` and `frame_qa.py` on every plate, judges, `paintout.py` for small fixes, edit, `flatspot.py`,
`deliver.py master/mux/review`, `blind_reel.py` once the real twins exist.

Smoke-tested on 19 Oct 2026 with synthetic clips (ffmpeg 9.0.1, OpenCV 5.0.0, NumPy 2.4.6, macOS).
