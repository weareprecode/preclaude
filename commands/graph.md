---
description: Turn any workflow into a managed agent graph - parallel lanes, skeptic pass, merge, human gate
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, Agent, Skill
argument-hint: [question or workflow, e.g. "should I launch an AI bookkeeping tool for Shopify merchants?"]
---

# Graph Command

Run any question or workflow as an agent graph instead of one giant chat: a planner splits it into parallel lanes, a skeptic attacks the evidence, a merger synthesises the survivors, and a human gate sits before anything expensive.

## Instructions

Follow the `graph-engineering` skill exactly (invoke it via the Skill tool if available; otherwise read `~/.claude/skills/graph-engineering/SKILL.md`).

If $ARGUMENTS is provided, treat it as the question or workflow to graph. Otherwise ask:

```json
{
  "questions": [{
    "question": "What should I run as a graph?",
    "header": "Workflow",
    "options": [
      {"label": "A decision", "description": "A should-we question that needs evidence from several angles before you commit"},
      {"label": "A recurring workflow", "description": "Something you already run with AI weekly - research, content, feedback synthesis"},
      {"label": "An existing one-shot answer", "description": "Re-run a single-pass AI answer you don't fully trust as a proper graph"}
    ],
    "multiSelect": false
  }]
}
```

Deliverables, in order:
1. The graph design shown BEFORE running: lanes, arrows, skeptic, and where the human gate sits
2. Parallel lane subagents, each writing its own file under `docs/graphs/<slug>/`
3. A `@skeptic` pass over all lanes (`review.md`) - killed, wounded, survived, unanswered
4. `recommendation.md` built only from surviving evidence, ending at the human gate

The graph produces the evidence; the user makes the decision. Never take the gated action yourself.
