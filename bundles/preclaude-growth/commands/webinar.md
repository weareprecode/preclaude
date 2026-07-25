---
description: Write a complete presentation-funnel script — one big belief, story-driven objection breaking, and a stack-and-close, for webinars, VSLs and launch keynotes
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
argument-hint: "[offer to present, or path to offer doc]"
model: sonnet
---

# Webinar Command: $ARGUMENTS

Builds the classic perfect-presentation structure: teach a new way of seeing the problem, break the three beliefs blocking the sale with stories (not arguments), then stack the offer. Works for live webinars, evergreen VSLs, and launch presentations.

## Step 1: Load the Offer

- If `$ARGUMENTS` is a path → read the offer doc (ideally from `/offer`).
- Otherwise gather: the offer, price, the avatar, and their current alternative.

<offer_docs>
!`find ./docs -name "*offer*" 2>/dev/null | head -3 | xargs cat 2>/dev/null | head -200 || echo "No offer docs — run /offer first for best results"`
</offer_docs>

## Step 2: Find the One Big Belief

Complete this sentence — it is the entire presentation's job:

> "If I can get them to believe that **[new opportunity/mechanism] is the key to [dream outcome]** and it's only attainable through **[my vehicle]**, then all other objections become irrelevant."

Position the offer as a **new opportunity**, not an improvement ("a better X" invites comparison shopping; "a different way entirely" doesn't).

## Step 3: Map the Three False Beliefs

| # | Belief type | The doubt in their head | Your story's job |
|---|------------|-------------------------|------------------|
| 1 | **Vehicle** | "Does this approach even work?" | Prove the new opportunity works |
| 2 | **Internal** | "It works, but could *I* do it?" | Prove someone like them did it |
| 3 | **External** | "I could, but [time/money/tech/spouse] blocks me" | Prove the blocker is handled |

## Step 4: Write the Stories (Epiphany Bridge)

Every belief is broken with a story, never a lecture. Each story follows:

1. **Backstory** — where you/the case study started (same place as the audience)
2. **Wall** — the struggle with the old way
3. **Epiphany** — the moment of discovering the new way
4. **Plan** — what you did about it
5. **Conflict** — what almost stopped it working
6. **Achievement** — the result, stated in numbers
7. **Transformation** — who you became (identity, not just outcome)

Write four stories: the **origin story** (opening) + one per false belief. Mark facts needed from the user as `[USER: real detail]`.

## Step 5: Assemble the Script

```markdown
# [Presentation Title — curiosity + promise, e.g. "How to [result] without [pain]"]

## Part 1: The Opening (10%)
- Big promise + what they'll learn in the next X minutes
- Hook to stay to the end (named bonus revealed at the end)
- Origin story (epiphany bridge #1) → introduces the new opportunity
- The One Big Belief stated as the presentation's thesis

## Part 2: The Content (60%)
Three secrets, each = one false belief reframed as a teaching point:
- **Secret 1 (vehicle)**: "[Contrarian statement about the approach]" + story #2
- **Secret 2 (internal)**: "[You don't need X to do this]" + story #3
- **Secret 3 (external)**: "[The blocker myth]" + story #4
Each secret: state the myth → tell the story → state the new belief → mini-proof.

## Part 3: The Stack & Close (30%)
- Transition: "Let me ask you a question…" (permission to present)
- Reveal the offer, then STACK: re-list every component one at a time with its value, running total after each
- Show total value vs price (anchor: value ≥ 10× price)
- Guarantee (from /offer)
- Scarcity/urgency (only what's true)
- Close loop: restate dream outcome, the two futures ("do nothing vs act"), final CTA
- Q&A that re-answers the three false beliefs
```

## Step 6: Output

Save to: `docs/marketing/webinar-script-[date].md` with the full script (speakable, first person), a slide outline (one line per slide), and the registration-page copy (headline, 3 curiosity bullets, CTA).

## Rules

- Stories carry the persuasion; if a section argues instead of narrates, rewrite it.
- Never fabricate case studies — every proof point is `[USER: …]` until the user supplies it.
- Registration and follow-up emails: generate with `/emailseq`; show-up sequence: `/nurture`.
