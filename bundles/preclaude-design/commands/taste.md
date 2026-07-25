---
description: Build and maintain a taste library — turn saved screenshots and URLs into reusable aesthetic references
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, AskUserQuestion
argument-hint: [add <path-or-url> | review | brief <family> — optional, prompts if omitted]
---

# Taste library: $ARGUMENTS

Curate a library of design references you actually like, classified so that `/variants` and any other design work can use it as its foundation instead of regressing to the mean.

Read the `design-taste` skill first — it defines the library format, the aesthetic families and the anti-slop guardrails. Everything below assumes it.

## Modes

Infer the mode from `$ARGUMENTS`. If it's empty, look at the state of `.taste/` and pick the sensible one — if there's no library, start one; if there is, offer to add to it or review it. Ask only when genuinely ambiguous.

- **`add <path|url|folder>`** — ingest new references
- **`review`** — audit the existing library
- **`brief <family>`** — print the paste-ready brief for one family
- **no argument** — set up, or ask which of the above

---

## Adding references

Sources worth pointing people at, if they ask where to look: Dribbble, Pinterest, Twitter/X, Godly, Land-book, SiteInspire, and the sites of products they already admire. The instruction is simple — save what you like, without over-thinking why. The classification is this command's job.

For each incoming reference:

1. **Look at it properly.** Read the image, or fetch the URL. Do not classify from a filename.
2. **Assign a family** from the skill's vocabulary. If nothing fits, invent one and say so — a new family is a signal of genuine taste, not a failure. Never force a reference into a family it doesn't belong to.
3. **Extract the vocabulary** — the actual design terms that describe it: type classification and pairing, colour behaviour, grid and composition, imagery treatment, motion character, texture. This vocabulary is the point. It is what lets someone ask for the thing again.
4. **Note what specifically is good about it.** One line. "The rule under the eyebrow text and the way the index tracks the scroll", not "clean and modern".
5. **Write the entry** into `.taste/library.json`, copying images into `.taste/images/`.

When a family reaches a couple of entries, write or update `.taste/families/<name>.md` — the standalone, paste-ready brief described in the skill. Keep it honest to the references rather than idealised.

Where a reference has a strong hero treatment, also record an **image prompt** on the entry: the description you'd hand an image generator to produce something in that spirit. `/variants` uses it when generating hero imagery.

## Reviewing

A library review should be useful, not flattering. Report on:

- Which families are well-represented and which are thin
- Whether the spread is genuinely diverse, or eight variations of one idea wearing different hats
- Entries whose classification looks wrong on a second look
- Dead URLs and missing image files
- What's conspicuously absent given what they build — no data-dense references for someone shipping dashboards, no long-form references for someone writing docs

Say plainly if the library is too small to be useful yet. Under roughly a dozen entries it mostly reflects whatever they saw last week, not their taste.

## Guardrails

- Never fabricate an entry. If an image can't be read or a URL can't be fetched, say so and skip it.
- Never invent attribution. Record the source if it's known; leave it blank if not.
- The library records *inspiration*, not assets to reuse. Do not copy anyone's images, copy or code into a project.
- Don't rewrite an existing entry's notes without saying what changed — those notes are the user's judgement, not yours.
- `.taste/images/` can get large. Suggest gitignoring it if the project tracks the library.

## Finishing

Summarise what's in the library now — entries per family, what's new, what's thin — and give them the one next action that matters. Usually that's `/variants` if the library is ready, or "go and save a dozen more" if it isn't.
