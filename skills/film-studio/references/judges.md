# Judge lane briefs

Each judge runs as its own agent, separate from the lane that made the work. Start each brief with: "Read the run brief and hard rules first: <path>. Your lane: <name>. Write evidence to <ledger>/evidence/<lane>/. Default to KILL if unsure. If a tool or safety check refuses something, record it; never work around it. Return a structured result: lane, status, headline, files, findings (each citing a file, frame or measurement), killed_shots, decisions_for_the_reviewer."

Every judge rules each item PASS, FIX (with the exact fix: region, frames, trim point) or KILL, with frame numbers and times.

## Claims red team
"Two hostile experts: a domain expert from a competitor, and a sceptical journalist who pauses every frame. Grade every caption and every on-screen number:
- S1: false on a pause;
- S2: needs context the film lacks;
- S3: holds, but tighten it.
Give an exact rewording for each, with evidence (the saved response file or capture metadata). Check:
- the capture time against time words ('rush hour', 'night');
- universal words;
- simulation shown as real;
- scale against documented limits;
- legal or terms adjacency;
- partner wording.
Merge your findings into the family's kill register and re-check every older kill against this cut."

## Lawyer (advertising standards)
"Rule each scene GO, GO WITH CONDITIONS or KILL under the CAP Code, the DMCC Act 2024 s.226 (overall impression), ASA guidance on AI in ads (29 May 2025: disclosure does not cure a misleading message), EU AI Act Art. 50(4), platform AI labels and brand guidelines (e.g. Apple: no simulated Apple products). Conditions must be concrete.
Apply the adjacency rule: no made frame under, or within one shot of, 'real', 'live', 'captured', 'right now' or 'our rig'.
Never imply customers. Specify the 'Made with AI' tag size and placement, and the end-card and description lines."

## Forensic red team
"Try to prove each shot is AI, at 100 % on pause and at normal speed on a phone. Run:
- the temporal and cadence script (repeat frames, uneven steps, flicker) [frame_qa.py];
- OCR on sampled frames [ocr_gate.sh];
- checks on hands, anatomy, physics, shadows against the light, reflections, repeated textures and warped geometry;
- blur edges and pops;
- mirror tells (text, handedness, sun side);
- comped-screen noise against its surroundings.
Then look for panel-level tells across clips: the same screen segment, frame-rate mismatch, smudges only on made clips, metadata.
Rank each clip's tells worst first. Re-rule every insert in the finished cut, not just as a plate. Never upload clips to third-party detectors."

## Examiner (domain realism, zero-error)
"Write or reuse a coded checklist for the domain (for UK roads: cabin and right-hand drive, mount, screen, keep left and lanes, roundabouts, signs, road markings, plates, speed and gap, night lights, AI artefacts, admin).
One failed gate fails the clip. Doubt counts as a fail. A fault in one pausable frame counts.
Watch once at normal speed, step at 0.25x at 100 %, and check the first, middle and last frames. Trimming is a valid fix. Give the frame times for every fault."

## Vision (attention)
"Run a local saliency model (spectral residual plus compensated motion plus centre bias, or DeepGaze if available; say which). It's a PASS when the attention peak sits within 0.05 of the story element's box at least 60 % of the time.
At each cut, flag an attention jump over 0.30 of the frame diagonal (the eye has to search) or motion directions that conflict across the cut.
Supply heatmap stills as evidence."

## Editor (measurement, not a judge but a gate)
"Measure per-second motion (flow as % of width per second, share of pixels changing) and cut rate. Report LOW runs on the strict reading (cuts do not break a run) and on the eventful reading. Confirm borderline runs frame by frame [flatspot.py].
Inserts need median flow of at least 3 % w/s and at least 10 % of pixels active.
Never cut before every judge's verdict file exists."
