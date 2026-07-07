---
description: Atomise one pillar (demo + notes) into the week's approved-queue content
allowed-tools: Read, Write, Glob, Grep, Bash
argument-hint: [pillar-folder-name, e.g. 2026-07-13-stripe-extraction]
---

# Atomise: $ARGUMENTS

Turn one piece of raw material (Monday's demo + notes) into the week's platform-native content queue. Nothing you produce is published by this command: everything lands in `outputs/` for Matt's review, and optionally in the posting rail as DRAFTS.

## Step 0: Locate the codex

The marketing codex must be in the current workspace (look for `marketing-codex/` here or one level up). If not found, STOP and say so.

<voice>
@marketing-codex/codex/voice.md
</voice>

<funnel>
@marketing-codex/codex/funnel.md
</funnel>

## Step 1: Read the pillar

Read everything in `marketing-codex/pillars/$ARGUMENTS/`: notes.md (required), any demo video/screenshots (note filenames for attachment references), and identify which product this pillar concerns. Then read the matching `marketing-codex/products/<product>.md` one-pager. Every claim in your output must trace to notes.md or the one-pager. If notes.md is missing, STOP and ask for it.

## Step 2: Check the quota BEFORE generating

Run: `ls marketing-codex/pillars/*/outputs/*.md 2>/dev/null | xargs grep -l "scheduled-for: $(date +%G-W%V)" 2>/dev/null | wc -l`

Hard caps from voice.md: max ONE original post per platform per day, 3 to 5 per week per platform, 80/20 value-to-ask. If this week's queue is already at cap, generate FEWER pieces and say which cap bound you. Never stack posts into future weeks to dodge the cap.

## Step 3: Generate into `marketing-codex/pillars/$ARGUMENTS/outputs/`

Each file starts with frontmatter:
```
---
platform: linkedin | x | blog | newsletter | clip-script
scheduled-for: <ISO week, e.g. 2026-W29>
status: draft
utm: utm_source=<platform>&utm_medium=organic&utm_campaign=$ARGUMENTS
---
```

Produce:
1. **linkedin.md** — the primary post (LinkedIn is the primary channel). 1,300 chars sweet spot, line breaks every 1 to 2 sentences, no external link in the first line, reference the video natively.
2. **x.md** — the X version. Leads with the visual. Single post preferred; thread only if genuinely needed, 5 tweets max.
3. **clips.md** — 2 to 3 clip specs from the demo: timestamp in/out, caption text, one-line hook each. If ffmpeg and the video file are available, actually cut them: `ffmpeg -ss <in> -to <out> -i <video> -c copy outputs/clip-N.mp4`.
4. **newsletter-section.md** — 150 to 250 words for the fortnightly send.
5. **blog.md** — the evergreen version: direct 40-to-60-word answer up top, honest comparisons naming competitors where relevant, FAQ block for AI-answer extraction.

## Step 4: Voice check (self-verify before finishing)

Re-read voice.md's banned list. Scan every output for: em dashes, US spellings, hype adjectives, "look what I built" framing, any number not present in the sources, more than one emoji. Fix violations, then note in your summary that the check ran.

## Step 5: Queue to the posting rail (drafts only, if configured)

If `PUBLER_API_KEY` is set in the environment AND `marketing-codex/automation/publer-rail.md` marks the rail as ACTIVE: push linkedin.md and x.md as SCHEDULED DRAFTS via the rail script (`marketing-codex/automation/scripts/queue-drafts.ts`), state "draft". NEVER call any publish/auto-post endpoint. If the rail is not configured, skip silently: the outputs folder IS the queue.

## Step 6: Report

Summarise: pieces produced, quota state (N of cap used this week), voice-check result, and the one-line reminder that nothing publishes until Matt approves.
