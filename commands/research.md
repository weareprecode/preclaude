---
description: Research competitors, market gaps, and validate ideas using deep web research
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch
model: opus
argument-hint: [idea-or-prd-description]
---

# Research Command

Analyse an idea, PRD, or product concept for competitive landscape, market gaps, and validation.

## When to Use

- Before building (from `/full-build` when user selects research)
- Standalone competitive analysis
- Market validation for new features
- Finding gaps and opportunities

## Phase 1: Understand the Idea

If $ARGUMENTS provided, use that as the idea description.
Otherwise, ask:

```json
{
  "questions": [{
    "question": "What idea or product do you want me to research?",
    "header": "Idea",
    "options": [
      {"label": "New product idea", "description": "I'll describe a product concept to validate"},
      {"label": "Existing PRD", "description": "Analyse competitors for a PRD I've already created"},
      {"label": "Feature addition", "description": "Research if a specific feature is worth building"},
      {"label": "Market exploration", "description": "Explore a market/category to find opportunities"}
    ],
    "multiSelect": false
  }]
}
```

If user selects "Existing PRD", search for PRD files:
```bash
find . -name "*prd*.md" -o -name "*PRD*.md" 2>/dev/null | head -5
```

## Phase 2: Research Depth

```json
{
  "questions": [{
    "question": "How deep should I research?",
    "header": "Depth",
    "options": [
      {"label": "Deep research (Recommended)", "description": "Comprehensive analysis: 10+ competitors, features, pricing, reviews (~5-10 min)"},
      {"label": "Quick scan", "description": "Top 3-5 competitors, key differentiators (~2 min)"},
      {"label": "Focused analysis", "description": "I'll specify exactly what to research"}
    ],
    "multiSelect": false
  }]
}
```

## Phase 3: Execute Research

### Time Warning (Deep Research)

If user selected "Deep research", show warning first:

```markdown
⏱️ **Deep research typically takes 5-10 minutes** as I'll be:
- Searching for 10+ competitors
- Analysing features, pricing, and UX patterns
- Reading reviews and user feedback
- Identifying gaps and opportunities

Starting research now...
```

### Deep Research Process

1. **Identify Search Terms**
   - Extract key concepts from idea/PRD
   - Generate competitor search queries
   - Industry-specific terms

2. **Find Competitors**
   Use WebSearch with queries like:
   - "[product type] software"
   - "[product type] alternatives"
   - "best [product type] tools 2025"
   - "[product type] startups"

3. **Analyse Each Competitor**
   Use WebFetch on each competitor's site to extract:
   - **Positioning**: How they describe themselves
   - **Features**: What they offer
   - **Pricing**: Tiers, pricing model
   - **Target audience**: Who they serve
   - **UX patterns**: How they solve the problem
   - **Weaknesses**: Reviews, complaints, missing features

4. **Find Reviews and Sentiment**
   Search for:
   - "[competitor] reviews"
   - "[competitor] vs alternatives"
   - "[competitor] complaints reddit"
   - "why I switched from [competitor]"

5. **Identify Market Gaps**
   Look for:
   - Features users request but no one offers
   - Underserved niches
   - Pricing gaps (too expensive or no free tier)
   - UX problems across competitors
   - Geographic or industry-specific gaps

### Quick Scan Process

1. Search for top 5 competitors
2. Brief analysis of each (1 paragraph)
3. Key differentiators
4. Obvious gaps

## Phase 4: Generate Report

Create `docs/research/competitive-analysis.md`:

```markdown
# Competitive Analysis: [Product/Idea Name]

**Generated**: [date]
**Research Depth**: [deep/quick]

## Executive Summary

[2-3 sentence overview of findings and recommendation]

## The Idea

[Brief description of what we're validating]

## Competitive Landscape

### Market Overview
- **Market size**: [if found]
- **Growth trend**: [growing/stable/declining]
- **Key players**: [top 3-5]

### Competitor Analysis

#### [Competitor 1]
- **URL**: [url]
- **Positioning**: [how they describe themselves]
- **Target audience**: [who they serve]
- **Key features**:
  - [feature 1]
  - [feature 2]
  - [feature 3]
- **Pricing**: [tiers/model]
- **Strengths**: [what they do well]
- **Weaknesses**: [gaps, complaints, missing features]
- **Reviews**: [sentiment summary]

#### [Competitor 2]
[same structure]

### Feature Comparison Matrix

| Feature | Us (Proposed) | Comp 1 | Comp 2 | Comp 3 |
|---------|---------------|--------|--------|--------|
| [Feature A] | ✅ | ✅ | ❌ | ✅ |
| [Feature B] | ✅ | ❌ | ✅ | ❌ |
| [Feature C] | ✅ | ❌ | ❌ | ❌ |

## Market Gaps & Opportunities

### Gap 1: [Title]
- **What's missing**: [description]
- **Evidence**: [user complaints, missing features]
- **Opportunity**: [how we can fill this gap]

### Gap 2: [Title]
[same structure]

## Risks & Challenges

1. **[Risk 1]**: [description and mitigation]
2. **[Risk 2]**: [description and mitigation]

## Recommendations

### Build ✅
[If the idea is validated, explain why and what to prioritise]

### Pivot 🔄
[If the idea needs adjustment, suggest changes]

### Don't Build ❌
[If market is saturated or idea has fatal flaws, explain]

## Suggested Differentiators

Based on gaps identified:
1. [Differentiator 1] - [why this matters]
2. [Differentiator 2] - [why this matters]
3. [Differentiator 3] - [why this matters]

## Next Steps

If proceeding:
1. [Action 1]
2. [Action 2]
3. [Action 3]

---

## Raw Research Data

### Search Queries Used
- [query 1]
- [query 2]

### Sources Consulted
- [source 1] - [what we learned]
- [source 2] - [what we learned]
```

## Phase 5: Summary Output

```markdown
## 🔍 Research Complete

### [Product/Idea Name]

**Recommendation**: [Build ✅ / Pivot 🔄 / Don't Build ❌]

### Key Findings
1. [Finding 1]
2. [Finding 2]
3. [Finding 3]

### Top Competitors
| Competitor | Strength | Weakness |
|------------|----------|----------|
| [Name 1] | [strength] | [weakness] |
| [Name 2] | [strength] | [weakness] |
| [Name 3] | [strength] | [weakness] |

### Biggest Opportunity
[1-2 sentence description of the main gap/opportunity]

### Full Report
`docs/research/competitive-analysis.md`

---

**Next**:
- `/prd [idea]` - Create PRD with these insights
- `/full-build [idea]` - Build with research integrated
```

## Integration with Full-Build

When called from `/full-build`:
- Don't ask for idea description (use product_description from config)
- Don't ask for depth (use competitive_research from config)
- Return findings to be integrated into PRD
- Skip creating separate report file (add to PRD instead)
