---
description: Story-driven email sequences — 5-part onboarding soap opera, daily-broadcast episodes, and hook-story-offer diagnostics
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
argument-hint: "[soap-opera|broadcast|diagnose <file>] [product/context]"
model: sonnet
---

# Email Sequence Command: $ARGUMENTS

Builds emails people actually read: serialised story sequences for new subscribers, personality-driven broadcasts for the ongoing list, and a diagnostic for underperforming emails. (For lead-to-appointment follow-up use `/nurture`; this command is the marketing list.)

## Step 1: Determine Mode

- **soap-opera** (default for new subscribers) → 5-email serialised onboarding
- **broadcast** → a week of standalone daily-style emails
- **diagnose [file]** → hook-story-offer audit of existing emails

<context>
@README.md
</context>

## Step 2: Define the Attractive Character

Every email comes from a persona, not a brand. Establish (ask if unknown):
- **Identity**: leader ("follow me"), adventurer ("here's what I discovered"), reporter ("I interviewed/found"), or reluctant hero ("I didn't want to share this, but…")
- **Elements**: backstory, character flaws (flaws create trust), polarising opinions, parables they retell
- **Voice**: how they actually talk (read existing marketing/*.md for tone)

## Mode: Soap Opera Sequence

Five emails, days 0-4. Each opens a loop the next one closes — the cliffhanger IS the open-rate strategy.

| # | Day | Job | Beats |
|---|-----|-----|-------|
| 1 | 0 | **Set the stage** | Deliver the promised thing, introduce the character, open the first loop ("tomorrow I'll tell you about the day everything fell apart…") |
| 2 | 1 | **High drama** | Open at the worst moment of the backstory, the wall hit with the old way, close loop 1, open loop 2 (the discovery) |
| 3 | 2 | **Epiphany** | The moment the new way was found — the One Big Idea behind the product; soft link |
| 4 | 3 | **Hidden benefits** | What the new way ALSO fixed that they didn't expect; case study; clear CTA |
| 5 | 4 | **Urgency + CTA** | Honest reason to act now (expiring bonus, cohort, price); direct close; last loop closed |

Write all five in full: subject, preview text, body (150-300 words), CTA. Subjects = curiosity, not summary ("[weird trick]" no; "the day I deleted everything" yes).

## Mode: Broadcast (Daily-style Episodes)

Generate 7 standalone emails from the pattern: **ordinary moment → pivot → point → offer**.
1. Open with a small, concrete, personal moment (yesterday's bug, a conversation, something in the news)
2. Pivot: "which reminded me of…" — bridge to a lesson the avatar cares about
3. Make one point only
4. Tie to a soft CTA (every email links somewhere)

Vary the entertainment angle across the week: story, rant/polarising opinion, Q&A, behind-the-scenes, case study, curation with commentary, pure pitch (1 in 7 max fully promotional).

## Mode: Diagnose

Read the target file. For each email, score the three levers and fix the weakest:
- **Hook**: would the subject line win against 40 others in an inbox? Rewrite 3 alternatives.
- **Story**: does the body earn the read with narrative/personality, or is it corporate announcement voice?
- **Offer**: is there exactly one clear CTA with a reason to click now?

Output before/after per email with a one-line "why".

## Output

Save to: `docs/marketing/emails-[mode]-[date].md`

```markdown
# [Mode] Sequence: [Product]
**Character**: [identity + voice notes]
**Goal**: [what this sequence moves]

[Emails in full]

## Notes
- Send times, A/B subjects for emails 1 and 5
- Loops opened/closed map (soap opera)
```

## Rules

- Every story detail that must be true is marked `[USER: real detail]` — never invent biography.
- One CTA per email. One point per email.
- British English unless the project's existing copy says otherwise.
