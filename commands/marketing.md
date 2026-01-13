---
description: Generate marketing content from feature or release
allowed-tools: Read, Write, Glob
argument-hint: [feature-name or "release"]
---

# Marketing Content Generator: $ARGUMENTS

Generate multi-platform marketing content.

## Step 1: Gather Context

<prd>
!`find docs/prd -name "*$ARGUMENTS*" -o -name "*.md" 2>/dev/null | head -3 | xargs cat 2>/dev/null || echo "No PRD found"`
</prd>

<recent_changes>
!`git log --oneline -10 2>/dev/null || echo "No git history available"`
</recent_changes>

<readme>
@README.md
</readme>

## Step 2: Extract Key Messages

Identify from source material:
- **Core value proposition**: What problem does this solve?
- **Key benefits**: Top 3 user benefits (not features)
- **Differentiators**: What makes this unique?
- **Target audience**: Who cares about this?

## Step 3: Generate Content Bundle

Create `/marketing/[feature-name]/` with:

### release-notes.md
```markdown
# [Feature Name]

## What's New
[User-benefit focused description, 2-3 sentences]

## Highlights
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

## Getting Started
[Quick start instructions]

## Technical Notes
[Optional: API changes, migration notes]
```

### social-twitter.md
```markdown
# Twitter/X Posts

## Announcement
[280 chars max, hook + value + CTA]

## Thread (if needed)
1/ [Hook that creates curiosity]
2/ [Problem statement]
3/ [Solution intro]
4/ [Key benefit]
5/ [CTA with link]

## Hashtags
#[relevant] #[relevant] #[relevant]
```

### social-linkedin.md
```markdown
# LinkedIn Post

[Professional tone, 150-300 words]

Structure:
- Opening hook (insight or question)
- Problem context
- Solution story
- Results/benefits
- Call to action
- 3-5 hashtags

---

## Engagement Questions (pick one)
- [Question that invites comments]
- [Question that invites comments]
```

### social-instagram.md
```markdown
# Instagram

## Caption
[Visual-first, emoji structure, 2200 char max]

## Hashtags (20-30)
[Research-based relevant hashtags]

## Stories Sequence (5-7 frames)
1. [Hook frame]
2. [Problem frame]
3. [Solution frame]
4. [Benefit frame]
5. [Poll/question frame]
6. [CTA frame]
```

### email-announcement.md
```markdown
# Email Announcement

## Subject Line Options
A: [<50 chars, curiosity-driven]
B: [<50 chars, benefit-driven]

## Preview Text
[Extends subject line, 40-90 chars]

## Body

[Opening — address the reader's problem]

[Bridge — introduce the solution]

[Benefits — bullet points of value]

[Social proof — if available]

[CTA — single, clear action]

[Sign-off]
```

### blog-outline.md
```markdown
# Blog Post: [SEO Title with Primary Keyword]

## Meta
- **Target keyword**: [primary keyword]
- **Word count**: 800-1500
- **Audience**: [who this is for]

## Outline

### H1: [Title]

### Introduction (100-150 words)
- Hook: [opening that grabs attention]
- Problem: [what readers struggle with]
- Promise: [what they'll learn]

### H2: [Section 1 - Problem Deep Dive]
- [Key point]
- [Key point]

### H2: [Section 2 - Solution Introduction]
- [Key point]
- [Key point]

### H2: [Section 3 - How It Works]
- [Key point]
- [Key point]

### H2: [Section 4 - Benefits/Results]
- [Key point]
- [Key point]

### Conclusion
- Summary
- CTA

## Internal Links
- [Relevant existing content to link]

## External Links
- [Authoritative sources to reference]
```

## Step 4: Output Summary

```
MARKETING CONTENT GENERATED
===========================

📁 Created: /marketing/$ARGUMENTS/

Files:
- release-notes.md
- social-twitter.md
- social-linkedin.md  
- social-instagram.md
- email-announcement.md
- blog-outline.md

Key Messages Extracted:
- Value prop: [one line]
- Top benefit: [one line]
- Target: [audience]

Next steps:
1. Review and customize tone
2. Add visuals/screenshots
3. Schedule posts
4. Track engagement
```
