---
description: Generate a full launch-episode pack for a product or feature
allowed-tools: Read, Write, Glob, Grep, Bash, WebFetch
argument-hint: [product: layout | superduperui | roast, optionally + feature name]
---

# Launch pack: $ARGUMENTS

Generate the complete launch-episode package per the reusable checklist. Output only: nothing is submitted, posted or sent by this command.

## Step 0: Load context

<checklist>
@marketing-codex/launches/checklist.md
</checklist>

<voice>
@marketing-codex/codex/voice.md
</voice>

Read `marketing-codex/products/<product>.md` for $ARGUMENTS. If launching a feature, also read the product's changelog/recent commits for what actually shipped. Every claim must trace to these sources; the banned-claims section of the one-pager is absolute.

## Step 1: The wedge

Propose 3 candidate one-sentence wedges (the thing a stranger repeats to a colleague). Recommend one, with reasoning. The rest of the pack uses the recommended wedge but notes where copy changes if Matt picks another.

## Step 2: Gate check

List the launch gates from the one-pager and master plan (e.g. Roast: roastnow.com domain sweep + migrations; Layout: ungated npx path). Check what you can verify from the repo/live site (WebFetch the live URL, check the quickstart). Output a GO / NO-GO table. If any gate fails, say the launch date must move, and continue generating the pack anyway.

## Step 3: Generate the pack into `marketing-codex/launches/<slug>/`

1. **show-hn.md** — title (starts "Show HN:", plain, no hype), body, and the maker comment: why built, how it works technically, one honest limitation, what feedback is wanted.
2. **product-hunt.md** — only if the checklist says PH for this product type: tagline (60 chars), description, first comment, gallery shot list.
3. **directories.md** — pre-filled copy for each manual form (Uneed, Dev Hunt, Peerlist, BetaList, AlternativeTo, SaaSHub): name, tagline, description in each platform's length limits, category suggestions.
4. **x-thread.md** and **linkedin.md** — launch-day posts (voice.md rules; LinkedIn version for Matt, variant for Ben).
5. **email.md** — broadcast to the relevant list segment: subject options x3, body, plain-text feel. Mark clearly: create in Resend with send:false, Matt presses send.
6. **dm-supporters.md** — template for the personal night-before DM (share, never ask for upvotes) + a blank supporter list for Matt to fill.
7. **day-plan.md** — the hour-by-hour launch-day timeline from the checklist, adapted to this episode.

## Step 4: Report

Wedge recommendation, GO/NO-GO table, file list, and the three manual actions only Matt can do (form submissions, pressing send, living in the comments).
