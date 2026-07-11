---
description: Build an irresistible offer — value equation scoring, offer stack, pricing, guarantees, scarcity, bonuses, and naming
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
argument-hint: "[product or offer description]"
model: sonnet
---

# Offer Command: $ARGUMENTS

Build a complete, high-converting offer for a product or service. Works from `$ARGUMENTS`, or falls back to the current project's README and marketing docs.

## Step 1: Gather Context

<product_info>
@README.md
</product_info>

<existing_offer>
!`find ./docs -name "*offer*" -o -name "*pricing*" 2>/dev/null | head -5 | xargs cat 2>/dev/null | head -200 || echo "No existing offer docs"`
</existing_offer>

If the product, market, or price point is unclear, ask (max 4 questions):
1. **Who** is the ideal customer? (Be specific — "founders doing £10k-50k/mo", not "businesses")
2. **What result** do they want most?
3. **What do you sell today** and at what price?
4. **What's the delivery model?** (done-for-you, done-with-you, DIY/product)

## Step 2: Score the Market (before building anything)

Rate the target market 1-10 on each. A weak market caps any offer.

| Factor | Question | Score |
|--------|----------|-------|
| Pain | Is the problem urgent and painful, not a nice-to-have? | /10 |
| Purchasing power | Can they afford a premium price? | /10 |
| Easy to target | Do they gather somewhere reachable (channels, lists, communities)? | /10 |
| Growing | Is the market expanding, not shrinking? | /10 |

If total < 24, flag it and suggest a stronger niche or repositioning before continuing.

## Step 3: Score the Offer with the Value Equation

**Value = (Dream Outcome × Perceived Likelihood of Achievement) ÷ (Time Delay × Effort & Sacrifice)**

Maximise the top, minimise the bottom. For the current offer, list concrete answers:

- **Dream outcome**: What status/result does the buyer really want? State it in their words.
- **Perceived likelihood**: What proof, guarantees, track record raises belief it will work *for them*?
- **Time delay**: How fast do they see the first win? What can deliver a result in days, not months?
- **Effort & sacrifice**: What do they have to give up or do? What can be done for them instead?

Score each 1-10 and identify the weakest lever — that's where the offer improvement lives.

## Step 4: Build the Offer Stack

1. **List every problem** the customer hits before, during and after using the product (aim for 10+, in their words).
2. **Turn each problem into a solution** ("hard to write ads" → "plug-and-play ad templates").
3. **Choose a delivery vehicle for each** — vary cost-to-deliver: one-to-many assets (templates, recordings, tools) scale; one-to-one (calls, done-for-you) raises perceived value.
4. **Trim to the stack**: keep high-value/low-cost items, cut low-value/high-cost ones.
5. **Price each element** at plausible standalone value so the stack total dwarfs the price.

## Step 5: Add the Enhancers

- **Scarcity** (limited supply): capped seats/clients per month — only if genuinely true.
- **Urgency** (limited time): cohort start dates, price rises, expiring bonuses — only if genuinely true.
- **Bonuses**: break pieces of the offer out and present them as named bonuses, each with its own value. Bonuses > discounts; never discount first.
- **Guarantee** — pick one and word it exactly:
  - *Unconditional*: "Full refund in 30 days, no questions" — best for low-price/low-trust.
  - *Conditional*: "Do X, Y, Z; if no result, we [refund / work free until]" — best for high-ticket; ties refund to implementation.
  - *Anti-guarantee*: "All sales final because [consumable reason]" — for products consumed on delivery.
- **Naming** — use the M-A-G-I-C checklist: **M**agnetic reason why (who it's for/why now), **A**vatar (named audience), **G**oal (the outcome), **I**nterval (timeframe), **C**ontainer word (Challenge, Blueprint, System, Sprint, Accelerator).

## Step 6: Output

```markdown
# Offer: [Name]

## Market Score
[Table + verdict]

## Value Equation Audit
| Lever | Current | Improvement | Score |
|-------|---------|-------------|-------|

## The Core Offer
**[Name using naming formula]** — [one-line promise: who + outcome + timeframe]

## The Stack
| # | Component | Solves | Delivery | Standalone Value |
|---|-----------|--------|----------|------------------|
Total value: £X — Your price: £Y

## Bonuses
1. **[Bonus name]** (£X value) — [what/why]

## Guarantee
[Exact wording]

## Scarcity & Urgency
[Only what is genuinely true]

## Pricing Rationale
[Price anchoring, why premium beats cheap here, payment options]

## Next Steps
- Feed this into /copy sales-page or /webinar
- Sequence it with /moneymodel (attraction offer, upsells, continuity)
```

Save to: `docs/marketing/offer-[slug]-[date].md`

## Rules

- Premium pricing over discounting — a higher price must be justified by a bigger stack, not defended.
- Never invent fake scarcity, urgency or social proof. Flag anything that needs the user's real numbers.
- Charge as much as the value supports, deliver more than the price suggests.
