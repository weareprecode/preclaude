---
description: Ad creative volume engine — split winners into hook/meat/CTA, generate dozens of tested variations, plus a scaling plan
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
argument-hint: "[product/offer, or path to existing winning ad copy]"
model: sonnet
---

# Ad Factory Command: $ARGUMENTS

Most ad accounts stall because they test 5 ads a month. Winners come from volume: this command industrialises creative production by splitting ads into interchangeable components and recombining them.

## Step 1: Gather Inputs

- If `$ARGUMENTS` is a file path → read it as the current best-performing ad.
- Otherwise treat `$ARGUMENTS` as the product/offer description.

<product_info>
@README.md
</product_info>

<existing_ads>
!`find ./docs -path "*copy*ads*" -o -name "*ad-*" 2>/dev/null | head -5 | xargs cat 2>/dev/null | head -300 || echo "No existing ads found"`
</existing_ads>

Ask only if missing: target avatar, platform (Meta/TikTok/YouTube/Google), offer + CTA destination, and any known winning ad.

## Step 2: Deconstruct into Components

Every ad = **Callout → Hook → Meat → CTA**. Break the winning ad (or draft a baseline) into:

- **Callout**: how the right person knows it's for them (label the avatar, name the problem, name the place: "Gym owners in London…").
- **Hook**: the first line/3 seconds that earns attention.
- **Meat**: the value/proof body — the reasons to believe.
- **CTA**: exactly what to do next and why now.

## Step 3: Run the Kaleidoscope

Generate variations per component, then recombine. Default volume: **50 hooks, 10 meats, 5 CTAs** (scale down for a quick pass with `$ARGUMENTS` containing "quick" → 20/5/3).

### Hook angles (cover all)
1. Direct callout ("If you're a [avatar]…")
2. Big claim + timeframe
3. Question that presupposes the pain
4. Contrarian ("Stop doing [common advice]")
5. Story open ("Last month a [avatar] showed me…")
6. Proof-first (number, screenshot, result)
7. Warning/mistake ("The #1 reason [avatars] waste £X on…")
8. Curiosity gap
9. Us-vs-them / new-vs-old way
10. Social proof ("Why 300 [avatars] switched to…")

### Meat frames
Pain-agitate-solve, demonstration, objection-crushing, testimonial-led, mechanism ("why this works when X didn't"), before/after.

### CTA frames
Direct, deadline, bonus-linked, risk-reversal ("try it, guaranteed"), low-friction next step.

## Step 4: Assemble Ads

Produce a starter batch of **15 assembled ads** (best hook × meat × CTA combinations, no duplicate pairings), each formatted for the chosen platform's constraints (primary text/headline lengths, script vs static). For video platforms output as script: `[VISUAL] / [VO/TEXT]` lines.

## Step 5: Testing & Scaling Plan

```markdown
## Testing Protocol
- Creative day: one fixed day per week producing the next batch from that week's winners
- Test hooks first (biggest lever), then meat, then CTA
- Kill rule: pause anything > 2× target CPA after [spend threshold]
- Winner rule: a hook that wins gets 10 new variations next batch

## Scaling Past the Wall
- Rising CAC at scale = creative fatigue, not market saturation — answer with volume
- Rotate avatars/callouts to open new audience pockets
- Promote proven hooks across platforms
```

## Step 6: Output

Save to: `docs/marketing/ads-factory-[date].md` with sections: Components, Hook Bank (numbered), Meat Bank, CTA Bank, 15 Assembled Ads, Testing Protocol.

Pair with `/ugc` (marketing engine) to turn the winning scripts into rendered video ads.

## Rules

- Hooks must be specific to the avatar — generic hooks are auto-fails.
- Never fabricate results, testimonials or statistics; mark every proof slot `[USER: real proof here]`.
- Match platform compliance (no "you/your condition" callouts on Meta for sensitive categories).
