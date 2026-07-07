---
description: Deep competitive landscape + viability assessment of THIS product, published as a website report
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent, Artifact, Skill
argument-hint: [optional focus, e.g. "given Figma's latest updates"]
---

# Landscape Command

Run a deep, brutally honest competitive-landscape and viability assessment of the product in this repo, and publish a shareable website report.

## Instructions

Follow the `landscape-report` skill exactly (invoke it via the Skill tool if available; otherwise read `~/.claude/skills/landscape-report/SKILL.md`).

If $ARGUMENTS is provided, treat it as the focus/trigger for the assessment (e.g. a specific competitor event or platform update to weigh) and make sure at least one research agent covers it directly.

Deliverables, in order:
1. Parallel multi-agent web research sweep (6-8 dimensions) grounded in this repo's CLAUDE.md/README/memory
2. Adversarial bear case, bull case, and completeness critic, then gap-fill research
3. A polished self-contained HTML report (verdict stamp, moat scorecard, USP, ranked threats, focus plan, go/no-go) published as an Artifact - and deployed to Vercel for a public URL if the CLI is authenticated
4. Verdict saved to project memory, completion announced with the link

Be brutally honest. The user is deciding whether to keep building - a hedged report is a failed report.
