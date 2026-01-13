---
description: Create session handoff notes for continuity
allowed-tools: Read, Write, Bash(git:*)
---

# Session Handoff

Create handoff document for session continuity.

## Gather Context

<branch>
!`git branch --show-current 2>/dev/null || echo "Not in git repo"`
</branch>

<status>
!`git status --short 2>/dev/null || echo "No git status"`
</status>

<recent_commits>
!`git log --oneline -5 2>/dev/null || echo "No commits"`
</recent_commits>

<recent_changes>
!`git diff $(git rev-parse --short HEAD~5 2>/dev/null || git rev-list --max-parents=0 HEAD) --stat 2>/dev/null || echo "No recent changes"`
</recent_changes>

<modified_files>
!`git diff $(git rev-parse --short HEAD~5 2>/dev/null || git rev-list --max-parents=0 HEAD) --name-only 2>/dev/null || echo "No files"`
</modified_files>

## Create Handoff Document

Output to: `docs/handoff/[YYYY-MM-DD]-session.md`

```markdown
# Session Handoff: [Date]

## Session Summary
- **Goal**: [What we set out to accomplish]
- **Duration**: [Approximate time]
- **Branch**: [Current branch]

## Completed ✅
- [Completed item with file references]
- [Completed item with file references]

## In Progress 🔄
- [Item and current state]
  - Files: [relevant files]
  - Next step: [immediate next action]
  - Blocker: [if any]

## Not Started ⏳
- [Planned but not begun]

## Decisions Made
- **[Decision]**: [Reasoning]
- **[Decision]**: [Reasoning]

## Technical Notes
- [Non-obvious implementation detail]
- [Gotcha or workaround discovered]

## Questions/Blockers
- [ ] [Open question needing resolution]
- [ ] [Blocker requiring external input]

## Next Session Priorities
1. [Highest priority - specific and actionable]
2. [Second priority]
3. [Third priority]

## Files to Focus On
- `path/to/file.ts` — [why]
- `path/to/file.ts` — [why]

## Commands to Remember
```bash
[Any specific commands needed to continue]
```
```

## Update Task Files

If tasks exist in `docs/tasks/`, update their progress logs:

```markdown
### [Today's Date]
- [What was accomplished]
- [Current state]
- [Next steps]
```

## Output

```
SESSION HANDOFF CREATED
=======================

📄 Saved to: docs/handoff/[date]-session.md

Summary:
- Completed: [N] items
- In Progress: [N] items  
- Decisions: [N] documented

Next session priorities:
1. [Priority 1]
2. [Priority 2]

Run /learn to check for CLAUDE.md updates.
```
