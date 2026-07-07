---
description: Analyze session, score learnings, propose CLAUDE.md updates (strict filtering)
allowed-tools: Read, Write, Bash(git diff), Bash(git log), Bash(wc), Glob, Grep
model: opus
---

# Session Learning Analysis

Follow the claude-md-learner skill methodology exactly.

## 1. Audit Current State

<claude_md_content>
@CLAUDE.md
</claude_md_content>

<line_count>
!`wc -l CLAUDE.md 2>/dev/null || echo "0 (file not found)"`
</line_count>

## 2. Gather Session Evidence

<recent_commits>
!`git log --oneline -10 2>/dev/null || echo "No git history"`
</recent_commits>

<files_changed>
!`git diff $(git rev-parse --short HEAD~10 2>/dev/null || git rev-list --max-parents=0 HEAD) --name-only 2>/dev/null || echo "No changes tracked"`
</files_changed>

<diff_summary>
!`git diff $(git rev-parse --short HEAD~10 2>/dev/null || git rev-list --max-parents=0 HEAD) --stat 2>/dev/null || echo "No diff available"`
</diff_summary>

## 3. Analysis Instructions

### Audit Phase
- Count current CLAUDE.md lines against 300 max
- Flag any stale, redundant, vague, or obvious entries for removal
- Note gaps that this session might fill

### Evidence Phase  
- Identify commands that failed or required investigation
- Note file dependencies that weren't obvious
- Capture error→fix patterns that cost time

### Scoring Phase (0-2 points each, 10 max)
For each candidate learning:
| Criterion | Score |
|-----------|-------|
| Novelty | Not documented? |
| Frequency | Will recur? |
| Impact | Blocked/delayed work? |
| Specificity | Exact value/path/command? |
| Durability | Stable long-term? |

Thresholds:
- 8-10: Add
- 5-7: Add only if under 250 lines
- 0-4: Reject

### Auto-Reject (skip scoring)
- Framework basics, tool docs, generic advice
- File locations visible in tree
- Anything in README, config, or .env.example
- Temporary workarounds, future plans

### Format Phase
- Max 12 words per entry
- Fragments not sentences
- Inline conditions: "X — only when Y"

## 4. Required Output Format

```
CLAUDE.MD LEARNING ANALYSIS
===========================

📊 Status: [N]/300 lines

Session: [description]
Evidence: [N] files, [N] commits

AUDIT FLAGS:
------------
[List any stale/redundant entries found, or "None"]

CANDIDATES EVALUATED:
---------------------
[For each candidate]:
- "[learning]"
  N|F|I|S|D = [scores] → [total]/10 → [ADD/CONDITIONAL/REJECT]
  [If reject: reason]

PROPOSAL:
---------
Removals:
- [Section]: "[text]" — [reason]

Additions:  
+ [Section]: [entry ≤12 words]
  Score: [N]/10 | Evidence: [what happened]

Rejected:
- "[text]" — [score]: [reason]

────────────────
Net: [±N] lines → [new total]/300
Apply? (waiting for confirmation)
```

## 5. Rules

- Never auto-apply changes
- Show ALL candidates evaluated with scores
- Propose removals before additions if over 250 lines
- If no valid learnings: "No additions — session was routine or already documented"
- Be ruthless — when in doubt, reject
