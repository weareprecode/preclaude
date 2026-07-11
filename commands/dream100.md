---
description: Build your Dream 100 — the list of channels, creators and communities where your ideal customers already gather, with work-in and buy-in plans
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
argument-hint: "[product + ideal customer, e.g. 'design tool for indie SaaS founders']"
model: sonnet
---

# Dream 100 Command: $ARGUMENTS

Your dream customers are already congregating somewhere — in audiences someone else built. This command finds those ~100 places and produces two parallel plans: **work your way in** (earn attention) and **buy your way in** (pay for it).

## Step 1: Define the Dream Customer

From `$ARGUMENTS` and project docs, write a one-paragraph dream-customer profile: who they are, what result they're chasing, what they search for, whose advice they already trust.

<context>
@README.md
</context>

## Step 2: Research the Congregations

Use WebSearch to find real, named entries across every bucket (target ~100 total; minimum 10 per relevant bucket):

| Bucket | Examples to find |
|--------|-----------------|
| **Podcasts** | Shows the avatar listens to (guest slots + ads) |
| **Newsletters** | Substacks/independents with engaged niche lists |
| **YouTube channels** | Creators reviewing/teaching in the space |
| **Communities** | Slack/Discord groups, subreddits, forums, Facebook groups |
| **Influencers/accounts** | X/LinkedIn/Instagram/TikTok voices they follow |
| **Blogs & publications** | Where they read industry news |
| **Events & spaces** | Conferences, meetups, directories, marketplaces |
| **Adjacent tools** | Products with the same customer (integration/partner potential) |

For each entry capture: name, platform, URL, estimated audience size, why the avatar is there, and a warmth score (existing relationship? already know the product?).

## Step 3: Prioritise

Score each: **Reach** (audience size) × **Relevance** (avatar density) × **Accessibility** (realistic to land in 90 days). Produce:
- **Top 10** — pursue now, personally
- **Next 30** — systematic outreach
- **The rest** — nurture list (follow, engage, revisit quarterly)

## Step 4: The Two Plans

### Work Your Way In (free, slow, compounding)
For the Top 10, a per-target plan:
1. **Dig the well before you're thirsty**: follow, genuinely engage with their content for 2+ weeks before any ask
2. **Lead with value**: share their stuff with results, offer something useful (data, a free integration, a guest piece tailored to their audience)
3. **The ask ladder**: reply → conversation → small collab (quote, guest post) → big collab (podcast slot, co-launch)
4. Draft the first-touch message for each (personal, specific, no pitch)

### Buy Your Way In (fast, costs money)
- Which entries sell ads/sponsorships and roughly what they cost (research where possible, mark `[RATE UNKNOWN — email for kit]`)
- Recommended first tests: 2-3 cheap, high-relevance placements before any big spend
- Retargeting note: run traffic from these placements to a lead magnet (see `/valueladder` bait rung), never to a cold sales page

## Step 5: Output

```markdown
# Dream 100: [Product]

## Dream Customer
[Profile paragraph]

## The List
[Full table, grouped by bucket, with scores]

## Top 10 Plan
[Per-target: why them, warm-up actions, first-touch draft, the ask]

## Paid Placements
[Ranked test list with budgets]

## Weekly Cadence
- 15 min/day engaging with Top 10 content
- 3 first-touch messages/week
- Review and rotate the list monthly
```

Save to: `docs/marketing/dream100-[date].md`

## Rules

- Every entry must be real and verifiable (URL) — no invented podcasts or newsletters.
- Pair with `/listen` (marketing engine) to monitor these channels daily once built.
- Outreach drafts are drafts — nothing is ever sent automatically.
