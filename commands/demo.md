---
description: Semi-automated demo video: agent records the screen demo, you add voice
allowed-tools: Read, Write, Glob, Bash
argument-hint: [target-site or feature to demo]
---

# Demo pipeline: $ARGUMENTS

Part of the optional **marketing engine** module (see docs/MARKETING-ENGINE.md). Produce the raw material for a weekly demo video: a real recorded screen demo plus a timed voiceover script. The founder records the voice and approves; nothing staged, real output only.

## Step 0: Locate the codex and preconditions (hard gate)

Look for `marketing-codex/` in the current workspace or one level up. If missing, STOP and print:
"The marketing engine needs a marketing-codex workspace. See docs/MARKETING-ENGINE.md to scaffold one."

Check `npx playwright --version` and `ffmpeg -version` are available; if not, print install one-liners and STOP. Read `marketing-codex/codex/voice.md` and the relevant `marketing-codex/products/<product>.md` (ask which product if ambiguous).

## Step 1: Run the real thing

Exercise the actual product flow being demonstrated against $ARGUMENTS and capture the real output (counts, timings, generated artefacts). The demo's numbers come from this run, never invented. If the product one-pager defines a flagship demo format (e.g. a with/without comparison), follow it; reuse the previous scaffold in `marketing-codex/pillars/_demo-scaffold/` if present, create it if not.

## Step 2: Record

Playwright script (chromium, viewport 1920x1080, recordVideo) that walks the demo end to end, 60 to 90 seconds. Save to `marketing-codex/pillars/<new-pillar>/demo-raw.webm`, then `ffmpeg -i demo-raw.webm -c:v libx264 -crf 20 demo.mp4`.

## Step 3: Script + notes

Write in the new pillar folder:
- `notes.md` — the real numbers, the one insight, one honest limitation (this feeds /atomise)
- `voiceover.md` — a timed per-scene script (~140 words/minute) in the codex voice, plus a 10-second webcam hook line

## Step 4: Report

Pillar folder path, video duration, the one insight chosen, and the reminder: record the voiceover, then run /atomise on the pillar.
