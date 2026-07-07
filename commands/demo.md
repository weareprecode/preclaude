---
description: Semi-automated Monday demo video: agent records the screen demo, Matt adds voice
allowed-tools: Read, Write, Glob, Bash
argument-hint: [target-site or feature, e.g. stripe.com]
---

# Demo pipeline: $ARGUMENTS

Produce the raw material for Monday's demo video: a real recorded screen demo plus a voiceover script. Matt records 90 seconds of voice (or a 10-second webcam hook if a voice clone is configured) and approves.

## Step 0: Preconditions

Check `npx playwright --version` and `ffmpeg -version` are available; if not, print install one-liners and stop. Read `marketing-codex/codex/voice.md` and the relevant `marketing-codex/products/*.md`.

## Step 1: Run the real thing

For a Layout extraction demo (the flagship format):
1. `npx @layoutdesign/context init` against $ARGUMENTS in a scratch dir — capture the actual output (tokens found, layout.md produced). Real numbers only: count the extracted tokens for the script.
2. Build the with/without comparison: two minimal Next.js/Vite scratch pages, one styled by the extracted tokens, one default. (Reuse the previous week's scaffold in `marketing-codex/pillars/_demo-scaffold/` if present; create it if not.)

## Step 2: Record

Playwright script (`chromium, viewport 1920x1080, recordVideo`) that walks the demo: terminal running the extraction (use an asciinema-style paced replay or screen the real run), then the side-by-side comparison, 60 to 90 seconds total. Save raw video to `marketing-codex/pillars/<new-pillar>/demo-raw.webm`, convert: `ffmpeg -i demo-raw.webm -c:v libx264 -crf 20 demo.mp4`.

## Step 3: Script + notes

Write `notes.md` in the new pillar folder (the real numbers, the one insight, the honest limitation — per the example pillar's structure) and `voiceover.md`: a timed script (per-scene, ~140 words/minute) in Matt's voice for him to read over the cut, plus a 10-second webcam hook line.

## Step 4: Report

Pillar folder path, video duration, the one insight chosen, and the reminder: record voiceover, then run /atomise on the pillar.
