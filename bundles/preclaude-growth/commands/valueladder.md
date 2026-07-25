---
description: Map your products onto an ascending value ladder, find the gaps, and match the right funnel type to each rung
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
argument-hint: "[business or product suite description]"
model: sonnet
---

# Value Ladder Command: $ARGUMENTS

Nobody buys the expensive thing first. A value ladder gives every customer a cheap, easy first yes and a clear ascent to your highest-value offer — and tells you which funnel to build at each level.

## Step 1: Inventory What You Sell

From `$ARGUMENTS` and project docs, list every current product/service with price and delivery model. Include "hidden" products (consulting you do ad hoc, templates lying around).

<context>
@README.md
</context>

<pricing>
!`find ./docs -name "*pricing*" -o -name "*offer*" 2>/dev/null | head -3 | xargs cat 2>/dev/null | head -150 || echo "No pricing docs"`
</pricing>

## Step 2: Place Everything on the Ladder

Standard rungs (adapt names to the business):

| Rung | Price band | Role | Typical vehicle |
|------|-----------|------|-----------------|
| **Bait** | Free | Capture the lead, deliver a real quick win | Lead magnet, free tool, free trial |
| **Frontend** | £5-£100 | First transaction — turn lead into buyer, cover ad costs | Book/mini-course, starter plan, tripwire |
| **Middle** | £100-£2,000 | Core offer — the main transformation | Course, software plan, productised service |
| **Backend** | £2,000-£25,000+ | High-touch, high-margin | Done-for-you, consulting, enterprise |
| **Continuity** | Recurring | The baseline that smooths revenue | Membership, SaaS, retainer |

Each rung must deliver a **complete win** on its own AND create natural desire for the next rung ("value AND a reason to ascend").

## Step 3: Gap Analysis

Flag every structural problem:
- **No free rung** → nothing to feed the top of the ladder (fix with `/dream100` + a lead magnet)
- **No frontend** → you're asking strangers for a big yes; ads can't self-liquidate
- **Cliff jumps** (e.g. free → £5,000) → insert a rung
- **No continuity** → revenue resets to zero every month (fix with `/moneymodel`)
- **Orphan rungs** → products with no path in or out

## Step 4: Match Funnels to Rungs

| Rung | Funnel type | Pages |
|------|------------|-------|
| Bait | **Lead funnel** | Squeeze page → thank-you (+ frontend pitch) |
| Frontend | **Unboxing/tripwire funnel** | Sales page → order form (+ bump) → upsell → thank-you |
| Middle | **Presentation funnel** | Registration → webinar/VSL → offer page (`/webinar` writes the script) |
| Backend | **Application funnel** | Case-study page → application form → booked call (`/nurture` handles show-up) |
| Continuity | Built into thank-you pages and post-purchase sequences (`/emailseq`) |

Recommend which ONE funnel to build first: the rung with existing traffic and the biggest revenue leak.

## Step 5: Output

```markdown
# Value Ladder: [Business]

## The Ladder
[Visual: rungs bottom-to-top with names, prices, what each delivers, and the ascension hook to the next]

## Gaps Found
1. [Gap] → [Recommended fix + which command builds it]

## Funnel Map
[Table: rung → funnel type → pages → status (exists/missing)]

## Build Order
1. [Funnel] — because [traffic/leak reasoning]

## Ascension Triggers
[For each rung: the moment/result that should trigger the next-rung pitch]
```

Save to: `docs/marketing/value-ladder-[date].md`

## Rules

- Every rung must be a real, deliverable product — no aspirational vapourware rungs.
- One clear recommendation for what to build first, not a menu.
- Feed individual rungs into `/offer` to make each one irresistible.
