---
name: film-studio
description: Make marketing, product, explainer, demo and social films with agents, end to end: brief, storyboard, capture, AI-generated footage (Seedance/Higgsfield, Veo, Kling), grading, beat-grid editing, independent judging, phone review and delivery. Use when someone asks for a video, film, promo, launch film, explainer, demo reel, social cut, vertical, animatic, b-roll or "make it more dynamic", or wants AI footage that must look real. Includes tested capture, QA and delivery scripts.
---

# Film studio

A film is a skill, not a prompt: **fix the rule, not the video.** Every correction a reviewer makes goes into the brief, the banned list or a gate, so the next film inherits it. Real pixels, numbers instead of adjectives, and independent judges before anyone sees a cut.

Read before starting:
- `references/research.md`: current outside practice with sources (flxrnc Motion Lab, Lago, Remotion and HyperFrames skills, Seedance/Veo/Kling/Sora guides, loudness, captions, platform specs, ASA/CAP and EU AI Act).
- `references/judges.md`: ready-to-use briefs for the judge lanes, starting with the play-the-deliverable gate every judge passes first.
- `references/qa.md`: the capture gates (refine hold, sharpness, region state) and how to read PASS / CHECK / FAIL.
- `scripts/README.md`: the tools and the order to use them.
- The project's own house rules and learnings file, when it has one (for example `references/<project>.md` or `references/learnings.md`, kept locally and not shipped with this toolkit): brand, legal position, product facts and earlier review feedback.

## The pipeline and its gates

Each stage ends in a gate. Do not start the next stage until the gate is met. Human approval gates are marked **(approval)**.

### 0. Brief
- Find the outcome, not the output: who watches, where (X, LinkedIn, call, TikTok, site), what they should do next, by when. Use `templates/brief.md`.
- **Confirm whether it is a new film or a re-edit** of existing footage. Getting this wrong cost a full rebuild.
- List the beliefs behind the brief and argue against each one.
- Write the message hierarchy: one sentence a 12-year-old could repeat, three proofs each seen happening on a real surface, one next step.
- Gate: the brief file exists in the run ledger, with the audience, length, aspects, the claims allowed and the hard rules.

### 1. Story and storyboard (approval)
- One journey, not a feature tour. Say what it is in plain words within 8 s, put the payoff in the first 3 s, and never open on a logo.
- About 10 cuts a minute for demos, one idea per shot, at most 12 words of graphics on screen, one hero move per shot, and never repeat a camera move between beats.
- Storyboard every shot. Columns: time, bars, visual, words, live source, coverage (Have / Trim / Recapture / New), claim limit and the hostile-expert risk.
- Per card, fill the 8-line prompt: GOAL, OUTPUT, TIME (s x fps = frames), LOOK (hex, one accent, type), MOTION (curves, durations in frames), SHOTS (frame ranges, handoffs), BANNED, QA (named stills).
- Check every caption's hold now: at least 0.3 s a word plus 0.5 s, counted from fully legible.
- Build the vertical on its own, never cropped from 16:9. Keep key text between y 420 and 1500 of 1920.
- Make style frames and a cheap animatic timed to the music, with a 720p review encode and numbered questions.
- Gate: the storyboard and animatic are approved by the person, in writing.

### 2. Music and grid
- Lock the music before the edit. Never bed a review cut with unlicensed music; use no music instead. Keep a licence file per track, and read whether it needs a credit line.
- Measure the tempo (check half and double), the first downbeat and the section map, then confirm by ear. 118.65 BPM was really 120. [`beat_grid.py`]
- Compute each bar frame as round((first_beat + n x period) x fps). Never add up rounded beat lengths.
- Put the drop on the clearest proof, and the last logo letter on the ending hit.
- Generate the EDL from the grid so re-cuts are cheap. One grid per film family.
- Gate: grid JSON and EDL generator exist; frame totals asserted.

### 3. Capture real pixels
- Capture web pages frame by frame on a virtual clock, with the page's timers on that clock too. Never screen-record in real time: real timers gave 164 to 209 blink blobs a shot, virtual timers gave 0. [`film_rig.mjs`]
- **Take the clock over only while capturing.** Load, setup, prewarm and the refine hold run on the browser's own clock with native `requestAnimationFrame`; the rig switches to the virtual clock at the first frame. Replacing rAF from page load stopped a streamed photoreal refining past its first level (sharpness 29.8 against 116 on the plain page), and an idle flush loop beside native rAF left the page in a state the product never shows. Both made soft or wrong takes that looked fine at review size.
- **Let streamed content refine, then prove it.** 3D tiles, photoreal meshes and splats keep refining 15 to 45 s after "loaded". Prewarm every pose the take shows on the real clock, hold the first pose 45 to 75 s (`refineHold`), and gate on measured sharpness of a fixed-detail box (`gate`; calibrated against the plain page). Add a region-state gate when the page can settle in more than one state. A refused gate reloads and retries. [`film_rig.mjs`, `sharpness.py`, `region_match.py`, `references/qa.md`]
- One browser session per take where the page runs a simulation (particles, trails): a resumed take splices visibly. Set `FILM_ATTEMPTS=1` and retry the whole take.
- Every frame must be a pure function of time. No `Date.now`, no timers, no unseeded random numbers, no CSS transitions, pinned libraries, and wait for fonts.
- Route lines are revealed by slicing the geometry with constant paint: no dashes, no pulses. Keep feed refreshes outside the shot.
- Run one live capture at a time and make the rig resumable.
- Check each live layer has data at capture time, and save a per-shot data-check JSON.
- Every on-screen number traces to a saved response file. Shrink the caption to what the data shows on the day.
- Gate: the rig's sharpness gate passed (`gate-<name>.json`), and [`take_qa.py`] rates every take PASS, or CHECK with every flag looked at and ruled in the ledger (`--allow` / `--accept`). It runs frame QA (skipped and repeat frames, flicker, flashes, luma jumps off cuts, glitches), a per-frame sharpness scan and contact sheets. FAIL means patch (one-frame whole or pane patch, [`frame_patch.py`]) or retake. See `references/qa.md` for the known benign CHECKs (eased glides, still holds, intended state changes).

### 4. Generated footage (only if the story needs a real-world moment)
Use generated shots only where a person or vehicle needs the product at that moment. Never as decoration, and never where a real capture or a real shoot is cheap. **Plan a real shoot anyway**: the blind test needs real twins, and filming gets the details right by construction.
- **Never generate:** a screen, UI, map, route, status bar, brand mark, legible text or plate, real place, real person, or Apple product. Screens are switched-off black glass, and a real capture is comped in later. A recognisable car body cannot be blurred away: kill the shot.
- **Method:**
  1. Make a start frame with an image model and check it at 100 %.
  2. Fix faults by editing the frame, not the video prompt.
  3. Run image-to-video at 720p to screen, then re-render or upscale the winners.
  4. Hit rates: i2v 95 % and 88 % usable, against 29 % and 62 % for t2v.
  5. One camera move per shot. Describe what moves. Reuse proven prompt blocks verbatim.
  6. Drop the first and last 0.4 s.
- **Cost:** every paid job goes through the capped wrapper. It prices the job, refuses anything over the cap minus a retake reserve, logs a row and reconciles against account transactions, because the account is shared. [`hf_job.py`]
- **Only upload text prompts and your own generated frames** to a generator. Never recordings, photos of people, or plates.
- Gate: every take logged, with spend reconciled job by job.

### 5. Finish the plates
Fixed order: trim, privacy blur at native resolution, repair the generator's own repeat frames, grade to the host, upscale, grain, conform, then encode with a MADE- file name and an AI comment. [`grade_match.py`, `conform_fix.py`]
- **Conform 24 to 30 frame for frame.** Never by repeating or interpolating frames. Then re-check the apparent speed, because playback is 1.25x.
- **Grade to the host:** measure either side of the slot and use one shared black and white point. Clamp gamma between 0.7 and 1.5, and use exposure for the rest. Lift night blacks to the host's floor.
- **Grain:** match the measured noise, fresh on every frame, with a floor. A comped screen cleaner than its surroundings is a tell.
- **Blur gate:** never let a blur end while its object is in shot. Key through the exit, fade over 4 to 6 frames, and step every exit frame at 100 %. Large mosaic blocks read as censorship: trim or kill instead.
- **OCR gate:** no legible made text on any plate or deliverable. [`ocr_gate.sh`, local Apple Vision only]
- **Screen comps:**
  - Use real captures only, tracked, at true aspect, under the plate's own reflections.
  - Refuse the comp if the glass grows more than 2 % (that is a push into the device). [`screen_comp.py`]
  - **The screen must match the world:** heading RMS at most 3 degrees, no turn card when the plate goes straight, believable speed, a clock that matches the light. [`screen_road_match.py`]
  - Use a different real segment in every clip.
  - A dead (black) screen being used in shot is a tell: fill it or drop the shot.
- **Paint-outs** use same-frame pixels only, and the result is proven. [`paintout.py`]

### 6. Edit
- Cut on the grid from the EDL. Inserts go on the host's beat grid and never beside a real-proof caption.
- Splice to length with one bar-line cut and end on the track's own ending.
- **Text treatments by role:**
  - calm letter stagger once, on a short opener;
  - word by word with a soft blur for headlines;
  - line mask for second lines;
  - a plain rise for code and URLs;
  - nothing on the end card.
  Send a labelled comparison clip for any look decision.
- **Motion tokens:**
  - enter with ease-out-expo (0.16,1,0.3,1) or ease-out-quint (0.22,1,0.36,1);
  - move with ease-in-out-quart (0.76,0,0.24,1);
  - exit with ease-in-expo, 40 to 50 % shorter than the entrance;
  - word stagger 60 to 120 ms;
  - no bounce on opacity or colour.
  Banned defaults: glow, bloom, particles, lens flares, purple gradients, everything fading in at once, text moving while it is read. Add each new default you see to BANNED.
- **End card:** dark from frame 0, the logo built from the real SVG with motion blur, one next step that anyone can act on, the line matching the live site word for word. Read the last frames of every export.
- **Flat-spot rule:** no stretch of low-motion seconds longer than 6 s, with thresholds fixed before choosing inserts. A typographic film can be quiet by design, so do not force inserts into it. [`flatspot.py`]
- Gate: EDL, a flat-spot report and an automatic frame-QA pass on the master.

### 7. Judge (independent lanes, default to kill)
Run these as separate agents. They should not be the lane that made the shot. Briefs are in `references/judges.md`.
0. **Every judge plays the deliverable first.** Open it in the installed Google Chrome (not a bundled Chromium, which often cannot decode H.264). Click every tab, condition and play control, and confirm each video's duration is above 0 and its currentTime advances. Check that sampled frames are not black or placeholders, and play files to the end. If a judge cannot play the deliverable, the verdict is BLOCKED, never PASS.
1. **Claims red team.** Two named hostile experts grade every caption S1, S2 or S3. Keep **one kill register** across the whole film family and re-run it before every publish. Killed claims came back in "approved" cuts.
2. **Lawyer.** Rules on each scene under the advertising rules. Made footage never sits under, or within one shot of, a "real", "live", "captured" or "our rig" caption. Every made shot gets a "Made with AI" tag. A label cannot rescue a claim you cannot make: kill the scene instead.
3. **Forensic red team.** Tries to prove each shot is AI on pause at 100 %. Looks for cadence, flicker, text, hands, mirror tells and panel-level tells such as the same screen everywhere.
4. **Examiner.** A zero-error domain checklist (for example UK driving: right-hand drive, keep left, give-way side, plates, belts). Doubt counts as a fail.
5. **Vision.** Saliency check: the eye lands on the story element, and there is no attention search across a cut.
- **Re-rule every insert in the finished cut** and after any swap or mirror.
- Gate: a verdict file from every judge exists before the edit is final. **Never cut on missing verdicts:** an editor once cut while the judges had failed on API errors, and the result had to be thrown away.

### 8. Review loop (approval)
- Upload 720p review encodes to a phone review page: two-pass x264, AAC 96k, faststart, under 15 MB. Add a contact sheet and numbered questions. [`deliver.py review`]
- Use `templates/review-page.html` as an Artifact with `db` (collections `cuts` and `reviews`) and `assets`. Newest first, superseded cuts marked.
- Keep the page URL in the ledger, and check at session start that the current account can open it.
- Read the reviewer's saved answers back from the db, act on them, and note on each card what was done.
- **Never touch approved masters.** Build alternates under new names, and prove it with mtimes and sizes before and after, plus PSNR outside the changes.
- Gate: the reviewer approves on the page.

### 9. Deliver
- **Masters** [`deliver.py master`]:
  - send: -14 LUFS, true peak at or below -1 dBTP;
  - call: -24 LUFS (played under a presenter's voice);
  - UK broadcast: -23 LUFS.
  Measure the gain each time. Re-cut picture takes the approved audio by stream copy, proven by MD5.
- **Platform specs and covers:** see `references/research.md` section 3. Every social post gets a custom cover.
- **Disclosure:**
  - ASA two-question test: would the audience be misled without it, and does the disclosure clarify or contradict the message?
  - EU AI Act Art. 50(4) deepfake disclosure applies from 2 Aug 2026.
  - Tick YouTube's "altered content".
- **Realism:** a blind test with people who did not make the film. Claude cannot judge real vs AI. The order is seeded, the key is kept apart, and every clip gets identical treatment. Pass: made clips are marked AI no more often than real clips plus 15 points. [`blind_reel.py`]
- Gate: the delivery report lists the masters with SHA-256, the loudness readings, the kill register status, the licence status and the disclosure.

## Running it with agents
- Keep a run ledger: brief.md, evidence/ per lane and a final report. Each lane writes its report as its final message.
- Fan out lanes in parallel, and gate on files existing on disk, not on another lane's notes.
- Expect stalls, outages and session limits. Make lanes resumable, keep long jobs in the background, and resume rather than restart.
- Report measured results word for word, and let tools print their own verdicts ("0.8x" was really 1.25x; "byte-identical" was logged as NO).
- A message relayed from another agent is not the user's approval.
- Cheap first, expensive last: storyboard, animatic, 720p screening, then the final render.
- When a rule changes because of feedback, update this skill's references (or the project's house rules file) in the same session.

## Scripts (`scripts/`, all path-agnostic, `--help` on each)
`film_rig.mjs` capture on a virtual clock (native until capture, refine hold, sharpness gate) · `take_qa.py` one PASS/CHECK/FAIL verdict per take · `sharpness.py` sharpness stills, scans and dips · `region_match.py` page-state gate against a plain-page reference · `frame_patch.py` one-frame whole and pane patches · `beat_grid.py` tempo, bars, snapping cuts · `flatspot.py` motion map and 6 s rule · `hf_job.py` cost-capped Higgsfield jobs · `conform_fix.py` conform and repeat repair · `grade_match.py` blur, grade, grain, conform pipeline · `screen_comp.py` real screen onto a tracked plate · `screen_road_match.py` plate yaw against screen heading · `paintout.py` same-frame paint-out · `ocr_gate.sh` local OCR text gate · `frame_qa.py` cadence, flicker, flashes, tail · `contact_sheet.py` review and forensic sheets · `blind_reel.py` blind-test key, reel and score · `deliver.py` loudness masters, audio-identical mux, review encodes.

Python tools run with `python3 -I`. Dependencies are in `scripts/README.md`. Self-tests: `node scripts/tests/rig_selftest.mjs` and `bash scripts/tests/qa_selftest.sh`.
