---
description: Atomise one pillar (demo + notes) into a week of platform-native content drafts
allowed-tools: Read, Write, Glob, Grep, Bash
argument-hint: [pillar-folder-name, e.g. 2026-07-13-stripe-extraction]
---

# Atomise: $ARGUMENTS

Part of the optional **marketing engine** module (see docs/MARKETING-ENGINE.md). Turn one piece of raw material (a demo + notes) into a platform-native content queue. Nothing this command produces is published: everything lands in `outputs/` for human review, and optionally in a posting rail as DRAFTS.

## Step 0: Locate the codex (hard gate)

Look for a `marketing-codex/` directory in the current workspace or one level up. If it does not exist, STOP and print:
"The marketing engine needs a marketing-codex workspace (voice, positioning, config). See docs/MARKETING-ENGINE.md in the Preclaude repo to scaffold one."

Once found, Read: `marketing-codex/codex/voice.md` (voice + posting caps) and `marketing-codex/codex/funnel.md` (cross-promotion and UTM rules). All voice, cap and claim rules in those files are hard constraints.

## Step 1: Read the pillar

Read everything in `marketing-codex/pillars/$ARGUMENTS/`: notes.md (required), any demo video/screenshots (note filenames for attachment references). Identify which product the pillar concerns and read the matching `marketing-codex/products/<product>.md` one-pager. Every claim in your output must trace to notes.md or the one-pager; the one-pager's banned-claims section is absolute. If notes.md is missing, STOP and ask for it.

## Step 2: Check the quota BEFORE generating

Count this week's already-queued items: `ls marketing-codex/pillars/*/outputs/*.md 2>/dev/null | xargs grep -l "scheduled-for: $(date +%G-W%V)" 2>/dev/null | wc -l`

Apply the caps from voice.md (e.g. max one original post per platform per day, weekly totals, value-to-ask ratio). If the queue is at cap, generate FEWER pieces and say which cap bound you. Never stack posts into future weeks to dodge a cap.

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

Produce (respecting whichever platforms voice.md names as primary/secondary):
1. **linkedin.md** — long-form post for the primary channel; line breaks every 1 to 2 sentences; no external link in the first line; reference the video natively.
2. **x.md** — leads with the visual; single post preferred; thread only if genuinely needed.
3. **clips.md** — 2 to 3 clip specs from the demo: timestamp in/out, caption, one-line hook. If ffmpeg and the video are available, actually cut them: `ffmpeg -ss <in> -to <out> -i <video> -c copy outputs/clip-N.mp4`.
4. **newsletter-section.md** — 150 to 250 words.
5. **blog.md** — evergreen version: direct 40-to-60-word answer up top, honest comparisons naming competitors where relevant, FAQ block for AI-answer extraction.

## Step 4: Voice check (self-verify)

Re-read voice.md's banned list and style rules. Scan every output for violations (banned phrases, hype adjectives, unsourced numbers, style rules). Fix, then note in your summary that the check ran.

## Step 5: Queue to the posting rail (drafts only, if configured)

If `marketing-codex/automation/publer-rail.md` (or the rail named in codex/config.md) is marked ACTIVE and its env keys are set: push linkedin.md and x.md as DRAFTS via `marketing-codex/automation/scripts/queue-drafts.mjs`. NEVER call any publish/auto-post endpoint. If the rail is not configured, skip silently: the outputs folder IS the queue.

## Step 6: Report

Pieces produced, quota state (N of cap used this week), voice-check result, and the reminder that nothing publishes until a human approves.
