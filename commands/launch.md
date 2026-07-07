---
description: Generate a full launch-episode pack for a product or feature
allowed-tools: Read, Write, Glob, Grep, Bash, WebFetch
argument-hint: [product key from marketing-codex/products/, optionally + feature name]
---

# Launch pack: $ARGUMENTS

Part of the optional **marketing engine** module (see docs/MARKETING-ENGINE.md). Generate the complete launch-episode package. Output only: nothing is submitted, posted or sent by this command.

## Step 0: Locate the codex (hard gate)

Look for `marketing-codex/` in the current workspace or one level up. If missing, STOP and print:
"The marketing engine needs a marketing-codex workspace. See docs/MARKETING-ENGINE.md to scaffold one."

Then Read:
- `marketing-codex/launches/checklist.md` (the reusable episode playbook; if missing, use the module's default sequencing from docs/MARKETING-ENGINE.md and write a starter checklist)
- `marketing-codex/codex/voice.md`
- `marketing-codex/products/<product>.md` for $ARGUMENTS — if it does not exist, list the available product one-pagers and STOP.

If launching a feature, also read the product's changelog/recent commits for what actually shipped. Every claim must trace to these sources; the one-pager's banned-claims section is absolute.

## Step 1: The wedge

Propose 3 candidate one-sentence wedges (the thing a stranger repeats to a colleague). Recommend one, with reasoning. The rest of the pack uses the recommended wedge and notes where copy changes if another is chosen.

## Step 2: Gate check

List the launch gates from the one-pager (and any product docs it references). Verify what you can from the repo/live site (WebFetch the live URL, try the quickstart). Output a GO / NO-GO table. If any gate fails, say the launch date must move, and continue generating the pack anyway.

## Step 3: Generate the pack into `marketing-codex/launches/<slug>/`

1. **show-hn.md** — title (starts "Show HN:", plain, no hype), body, and the maker comment: why built, how it works technically, one honest limitation, what feedback is wanted.
2. **product-hunt.md** — only if the checklist includes PH for this product type: tagline (60 chars), description, first comment, gallery shot list.
3. **directories.md** — pre-filled copy for each manual form (Uneed, Dev Hunt, Peerlist, BetaList, AlternativeTo, SaaSHub): name, tagline, description within each platform's limits, category suggestions.
4. **social.md** — launch-day posts per the channels named in voice.md (primary + secondary variants; a co-founder variant if voice.md names one).
5. **email.md** — broadcast to the relevant list segment: 3 subject options, body, plain-text feel. Mark clearly: create as an UNSENT draft in the email provider; a human presses send.
6. **dm-supporters.md** — template for the personal night-before DM (share the link, never ask for upvotes) + a blank supporter list.
7. **day-plan.md** — the hour-by-hour launch-day timeline adapted to this episode.

## Step 4: Report

Wedge recommendation, GO/NO-GO table, file list, and the manual actions only the founder can do (form submissions, pressing send, living in the comments).
