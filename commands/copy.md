---
description: Audit existing copy, improve content, or generate new persuasive copy (sales pages, landing pages, email sequences, case studies, ads)
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Bash
argument-hint: "[audit|improve <file>|sales-page|landing|email-sequence|case-study|ads]"
model: sonnet
---

# Copy Command: $ARGUMENTS

## Step 1: Determine Mode

Based on `$ARGUMENTS`:
- **audit** → Run copy audit across the project
- **improve [file]** → Improve specific file's copy
- **sales-page** → Generate new sales page
- **landing** → Generate new landing page
- **email-sequence** → Generate email sequence
- **case-study** → Generate case study template
- **ads** → Generate ad copy variants

---

## Mode: Audit

Scan for existing copy and evaluate quality.

### Files to Analyse
<readme>
@README.md
</readme>

<landing_pages>
!`find . -name "page.tsx" -o -name "*.html" 2>/dev/null | head -10 | xargs grep -l -E "(hero|headline|cta|button)" 2>/dev/null || echo "No landing pages found"`
</landing_pages>

<marketing>
!`find ./marketing -name "*.md" 2>/dev/null | head -10 || echo "No marketing folder"`
</marketing>

<docs>
!`find ./docs -name "*.md" 2>/dev/null | head -10 || echo "No docs folder"`
</docs>

### Evaluation Criteria
For each file, score 1-10 on:
1. **Clarity**: Is the message immediately understood?
2. **Persuasion**: Does it motivate action?
3. **Voice**: Consistent brand tone?
4. **CTAs**: Clear, compelling, visible?
5. **Structure**: Scannable? Logical flow?
6. **SEO**: Keywords in headers, meta descriptions?

### Output Format
```markdown
# Copy Audit Report

Generated: [date]

## Summary
- Files analysed: X
- Average score: X/10
- Critical issues: X

## File Scores

| File | Clarity | Persuasion | Voice | CTAs | Structure | SEO | Overall |
|------|---------|------------|-------|------|-----------|-----|---------|
| README.md | X | X | X | X | X | X | X |
| ... | ... | ... | ... | ... | ... | ... | ... |

## Priority Fixes

### High Priority (Score < 5)
1. **[File]**: [Issue] → [Fix]

### Medium Priority (Score 5-7)
1. **[File]**: [Issue] → [Fix]

### Quick Wins
1. **[File]**: [Small change, big impact]

## Detailed Analysis

### [File Name]
**Score**: X/10

**Strengths**:
- [What's working]

**Issues**:
- [What needs fixing]

**Recommended Rewrite**:
[Before/after for key sections]
```

Save to: `docs/copy/audit-[date].md`

---

## Mode: Improve

Improve specific file's copy.

### Read Target File
!`cat "$ARGUMENTS" 2>/dev/null | head -200 || echo "File not found: $ARGUMENTS"`

### Analysis Process
1. Identify the file type (README, landing page, marketing, etc.)
2. Evaluate current copy against checklist:
   - [ ] Clear value proposition in first line
   - [ ] Benefits over features
   - [ ] Active voice
   - [ ] Specific outcomes (numbers, timeframes)
   - [ ] Social proof present
   - [ ] Clear CTA
   - [ ] Scannable structure
   - [ ] No jargon

3. Generate improved version with:
   - Stronger headlines
   - Clearer value propositions
   - Better CTAs
   - Improved structure

### Output Format
```markdown
# Copy Improvement: [filename]

## Current Issues
1. [Issue and why it matters]
2. [Issue and why it matters]

## Before/After Comparison

### Section: [e.g., Headline]
**Before**:
> [Original text]

**After**:
> [Improved text]

**Why**: [Explanation of improvement]

---

## Full Improved Version

[Complete rewritten content]

---

## Changes Made
- [Change 1]
- [Change 2]
- [Change 3]
```

Ask: "Apply these changes to [file]? (y/n)"

---

## Mode: Sales Page

Generate a complete sales page.

### Gather Context
<product_info>
@README.md
</product_info>

<existing_messaging>
!`find . -name "*.md" -exec grep -l -E "(feature|benefit|problem|solution)" {} \; 2>/dev/null | head -5 | xargs cat 2>/dev/null | head -500 || echo "No existing messaging found"`
</existing_messaging>

### Questions to Answer
1. **Product**: What are you selling?
2. **Audience**: Who is the ideal customer?
3. **Problem**: What pain point does this solve?
4. **Outcome**: What transformation do they get?
5. **Proof**: What evidence supports your claims?
6. **Offer**: What's the price/package?

### Sales Page Template
```markdown
# [Headline: Big Promise + Specific Outcome]

[Subheadline: Who it's for and how they get there]

[Primary CTA Button]

---

## You Know That Feeling When...
[Paint the problem in their words. Show you understand their frustration.]

## It Doesn't Have to Be This Way
[Bridge to the solution. Give hope.]

## Introducing [Product Name]
[One paragraph that positions the solution]

## Here's How It Works

### Step 1: [Action]
[Brief explanation]

### Step 2: [Action]
[Brief explanation]

### Step 3: [Action]
[Brief explanation]

## What You Get

### [Feature → Benefit]
[Description focused on outcome]

### [Feature → Benefit]
[Description focused on outcome]

### [Feature → Benefit]
[Description focused on outcome]

## Don't Just Take Our Word For It

> "[Testimonial quote]"
> — [Name, Title, Company]

> "[Testimonial quote]"
> — [Name, Title, Company]

## This Is Perfect For You If...
- [Ideal customer trait]
- [Ideal customer trait]
- [Ideal customer trait]

## This Is NOT For You If...
- [Disqualifying trait]
- [Disqualifying trait]

## Frequently Asked Questions

**Q: [Common objection as question]**
A: [Answer that overcomes objection]

**Q: [Common objection as question]**
A: [Answer that overcomes objection]

## Your Investment

[Package name]: [Price]

Includes:
- [Item]
- [Item]
- [Item]

[Guarantee statement]

## Ready to [Achieve Outcome]?

[Final CTA with urgency]

[Secondary reassurance: "Questions? Email us at..."]
```

Save to: `docs/copy/sales-page-[date].md`

---

## Mode: Landing Page

Generate a lead-gen landing page.

### Landing Page Template
```markdown
# [Benefit-Driven Headline]

[Supporting subheadline with specificity]

[Form: Name, Email, CTA Button]

---

## Why [Target Audience] Choose [Product]

### [Benefit 1 Headline]
[2-3 sentences. Focus on outcome, not feature.]

### [Benefit 2 Headline]
[2-3 sentences. Focus on outcome, not feature.]

### [Benefit 3 Headline]
[2-3 sentences. Focus on outcome, not feature.]

---

## Trusted By
[Logos or "Join 1,000+ teams who..."]

---

## What People Are Saying

> "[Short, punchy testimonial]"
> — [Name, Title]

---

## Get Started Now

[Repeat form or CTA]

[Trust signals: "No credit card required" / "Instant access"]
```

Save to: `docs/copy/landing-page-[date].md`

---

## Mode: Email Sequence

Generate an email sequence.

### Sequence Type
- **welcome**: New subscriber/customer onboarding
- **nurture**: Value-first relationship building
- **sales**: Conversion-focused sequence
- **re-engagement**: Win back inactive users

### Email Sequence Template
```markdown
# [Sequence Type] Email Sequence

**Goal**: [What this sequence achieves]
**Trigger**: [When someone enters this sequence]
**Duration**: [X emails over Y days]

---

## Email 1: [Purpose]
**Send**: Day 0
**Subject**: [Subject line]
**Preview**: [Preview text]

[Email body - 150-250 words]

**CTA**: [Action]

---

## Email 2: [Purpose]
**Send**: Day 2
**Subject**: [Subject line]
**Preview**: [Preview text]

[Email body]

**CTA**: [Action]

---

## Email 3: [Purpose]
**Send**: Day 4
**Subject**: [Subject line]
**Preview**: [Preview text]

[Email body]

**CTA**: [Action]

---

## Email 4: [Purpose]
**Send**: Day 7
**Subject**: [Subject line]
**Preview**: [Preview text]

[Email body]

**CTA**: [Action]

---

## Email 5: [Purpose]
**Send**: Day 10
**Subject**: [Subject line]
**Preview**: [Preview text]

[Email body]

**CTA**: [Action]

---

## Sequence Notes
- **A/B test**: Subject lines for emails 1 and 4
- **Personalisation**: Use first name, company name where available
- **Timing**: Adjust based on engagement data
```

Save to: `docs/copy/email-sequence-[type]-[date].md`

---

## Mode: Case Study

Generate a case study template.

### Case Study Template
```markdown
# How [Customer] Achieved [Specific Result] with [Product]

## At a Glance
| Metric | Before | After |
|--------|--------|-------|
| [KPI 1] | X | Y |
| [KPI 2] | X | Y |

**Industry**: [Industry]
**Company Size**: [Size]
**Time to Results**: [Duration]

---

## The Challenge

[2-3 paragraphs describing the problem they faced. Use their words where possible.]

### Key Pain Points
- [Pain point 1]
- [Pain point 2]
- [Pain point 3]

---

## The Solution

[2-3 paragraphs on how they implemented your product]

### Implementation Highlights
- [How they used feature 1]
- [How they used feature 2]

---

## The Results

### [Primary Metric]: [X% improvement]
[Explanation and context]

### [Secondary Metric]: [X% improvement]
[Explanation and context]

### Qualitative Wins
- [Non-numeric benefit]
- [Non-numeric benefit]

---

## In Their Words

> "[Detailed testimonial quote - 2-3 sentences]"
>
> — **[Name]**, [Title], [Company]

---

## Key Takeaways

1. **[Lesson]**: [How other prospects can apply this]
2. **[Lesson]**: [How other prospects can apply this]
3. **[Lesson]**: [How other prospects can apply this]

---

## Ready to Get Similar Results?

[CTA to talk to sales or start trial]
```

Save to: `docs/copy/case-study-[customer]-[date].md`

---

## Mode: Ads

Generate ad copy variants for multiple platforms.

### Ad Copy Bundle
```markdown
# Ad Copy: [Campaign/Product Name]

**Objective**: [Awareness / Traffic / Conversions]
**Target Audience**: [Description]

---

## Google Search Ads

### Ad Group 1: [Theme]

**Ad 1:**
- Headline 1 (30): [Keyword + Benefit]
- Headline 2 (30): [Differentiator]
- Headline 3 (30): [CTA]
- Description 1 (90): [Expand promise, include CTA]
- Description 2 (90): [Social proof or secondary benefit]

**Ad 2:**
[Variation]

### Keywords
- [keyword 1]
- [keyword 2]
- [keyword 3]

---

## Meta/Facebook Ads

### Ad 1: [Angle]
**Primary Text** (125 chars):
[Hook + Promise + CTA]

**Headline** (40 chars):
[Clear benefit]

**Description** (30 chars):
[Supporting point]

**CTA Button**: [Learn More / Sign Up / etc.]

### Ad 2: [Different Angle]
[Variation]

### Ad 3: [Social Proof Angle]
[Variation]

---

## LinkedIn Ads

### Ad 1: [Professional Angle]
**Intro** (150 chars):
[Business-focused hook]

**Headline**:
[Outcome for business]

**CTA**: [Learn More / Download / Request Demo]

### Ad 2: [Variation]
[Different angle]

---

## Testing Plan

### Phase 1: Creative Testing
- Test 3 headlines against each other
- Test 2 primary images/videos
- Run for 7 days, 100+ conversions per variant

### Phase 2: Audience Testing
- [Audience A]
- [Audience B]
- [Audience C]

### Success Metrics
- CTR target: >2%
- CPC target: <$X
- Conversion rate: >X%
```

Save to: `docs/copy/ads-[campaign]-[date].md`

---

## Output Summary

```
COPY COMMAND COMPLETE
=====================

Mode: [audit|improve|sales-page|landing|email-sequence|case-study|ads]

Output saved to: docs/copy/[filename].md

Next steps:
1. Review generated copy
2. Customise for your specific context
3. Test and iterate based on performance
```
