---
description: Research competitors, market gaps, and validate ideas using parallel research lanes and a skeptic pass
allowed-tools: Read, Write, Edit, Glob, Grep, WebSearch, WebFetch, Agent
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
- Running 4 parallel research lanes (customers, competitors, distribution, pricing)
- Reading reviews and user feedback
- Running a skeptic pass to kill weak findings
- Building the recommendation from surviving evidence only

Starting research now...
```

### Deep Research Process (diamond pattern)

One model researching, interpreting, AND grading its own answer in a single pass inflates confidence. Deep research runs as a graph instead: parallel lanes → skeptic → merge.

1. **Plan the lanes**
   Extract key concepts from the idea/PRD and write a one-paragraph brief per lane: the question that lane must answer, what evidence would settle it, and instructions to date every claim and note what could not be confirmed. Include today's date in every brief.

2. **Run 4 research lanes in parallel** — launch all subagents in a single message (use an agent type with WebSearch/WebFetch). Lanes are blind to each other; that independence is the point.

   - **Customer lane**: who has this pain and how do they solve it today? Search "[audience] [problem] reddit", "how do [audience] handle [problem]", forum threads, job-to-be-done evidence. Distinguish pain from willingness to pay.
   - **Competitor lane**: who already solves this? Search "[product type] software", "[product type] alternatives", "best [product type] tools [current year]", "[product type] startups". WebFetch each competitor's site for positioning, features, pricing, target audience; search "[competitor] reviews", "[competitor] complaints reddit", "why I switched from [competitor]" for weaknesses.
   - **Distribution lane**: where does this audience actually gather? Newsletters, communities, marketplaces, app-store categories, search terms with buying intent, who already has their trust.
   - **Pricing lane**: what do comparable tools charge and earn? Free-tier expectations, pricing gaps (too expensive / no entry tier), any shutdowns in the space (autopsy them).

3. **Skeptic pass** — after all lanes return, launch the `@skeptic` agent on the combined findings. It attacks: which claims are actually supported, which evidence is stale, which competitors are being ignored, where pain is confused with willingness to pay, and where the research sounds confident without proving anything. It may run its own verification searches.

4. **Merge** — identify market gaps and build the recommendation using ONLY claims that survived the skeptic:
   - Features users request but no one offers
   - Underserved niches
   - Pricing gaps (too expensive or no free tier)
   - UX problems across competitors
   - Geographic or industry-specific gaps

### Quick Scan Process

Single-pass is fine here — no lanes, no skeptic (say so in the output):
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

## Skeptic Pass

*(deep research only)*

### Killed
- [claim that did not survive — and why]

### Downgraded
- [claim that survives only in weakened form]

### Open Questions
- [question that would change the recommendation but couldn't be answered]

## Recommendations

*(built only from claims that survived the skeptic pass)*

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
