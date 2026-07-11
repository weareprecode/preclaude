---
description: Design your money model — attraction offer, upsells, downsells and continuity sequenced so new customers fund their own acquisition
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
argument-hint: "[product suite or business description]"
model: sonnet
---

# Money Model Command: $ARGUMENTS

An offer is *what* you sell; a money model is the **sequence** of offers that maximises how much gross profit you collect in the first 30 days — ideally more than it costs to acquire the customer, so growth funds itself.

## Step 1: Gather the Numbers

Ask for (or mark as `[NEEDED]`):
1. Every product/service you sell (or could sell) with price and gross margin
2. CAC — cost to acquire a customer (per channel if known)
3. Current 30-day gross profit per new customer
4. Payment rails available (one-off, split-pay, subscription)

<context>
@README.md
</context>

## Step 2: The Target — Customer-Financed Acquisition

**Rule: 30-day gross profit per new customer ≥ 2× CAC.** Hit that and advertising becomes self-funding — you can outspend competitors because every customer pays for the next one.

Three levers:
1. **Get more customers to buy more** (attach rate on upsells)
2. **Get them to pay more** (price/premium tiers)
3. **Get the money sooner** (pay-in-full incentives, upfront periods)

State the current gap: "CAC £X, 30-day GP £Y → need £Z more in the first 30 days."

## Step 3: Design the Four Slots

### 1. Attraction Offer (gets the yes)
Pick the best fit and design it fully:
- **Win-your-money-back**: buy-in refunded/credited on hitting a defined result (drives implementation AND cash)
- **Giveaway**: prize for one, discounted offer for every entrant
- **Decoy pricing**: cheap option that makes the premium the obvious buy
- **Buy X get Y free**: volume framing instead of discounting
- **Free/paid trial with skin in the game**: deposit, or free-until-result
- **Premium promotion / discount promotion / free promotion** — choose to match brand position; premium attracts better customers

### 2. Upsell (immediately after the yes)
- The "next problem" purchase: buying solves problem 1 and creates problem 2 — sell the solution at point of maximum trust
- Rules: offer at the moment of purchase or first win; make it a bigger/faster/done-for-you version; 1-click friction

### 3. Downsell (rescues the no)
- Payment plan, smaller scope, trial version, or "start with just X"
- Never a naked discount on the same thing — change the thing, not just the price

### 4. Continuity (recurring baseline)
- Membership, software, supplies, service retainer — what does the customer need *every month* after the first win?
- Bonus-for-staying beats penalty-for-leaving; anchor annual vs monthly

## Step 4: Sequence and Model It

```markdown
## The Model
[Attraction offer] → [Upsell 1] → (declines → [Downsell]) → [Continuity]

## 30-Day Cash Maths (per 100 customers)
| Step | Take rate | Price | Margin | GP per 100 |
|------|-----------|-------|--------|------------|
Total 30-day GP per customer: £X vs CAC £Y → ratio X:1 [PASS/FAIL vs 2:1]

## LTV Check
[6/12-month gross profit incl. continuity churn assumption]
```

Use conservative take rates (upsell 20-30%, downsell 15-25%, continuity 30-50%) unless the user has real data.

## Step 5: Output

Save to: `docs/marketing/money-model-[date].md` with: the numbers, the four slots fully worded (each offer gets name, price, pitch line), the sequence diagram, 30-day maths, and a rollout order (ship the upsell first — biggest lever, least new work).

## Rules

- Design offers the business can actually deliver; flag operational load per slot.
- Every claim slot needs real numbers from the user — never invent take rates as facts, label them assumptions.
- Build the core offer first with `/offer`; this command sequences offers, it doesn't replace them.
