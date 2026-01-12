---
description: Run Ralph autonomous build loop on existing prd.json (uses Ralph Wiggum plugin)
allowed-tools: Read, Write, Edit, Bash(*), Glob, Grep
model: opus
argument-hint: [iterations] [path-to-prd.json]
---

# Build with Ralph Wiggum

Execute the Ralph Wiggum autonomous build loop on an existing `prd.json`. Uses the Ralph Wiggum plugin's stop hook mechanism with completion promise for semantic exit.

## Philosophy

> "Ralph is a Bash loop" - Geoffrey Huntley

Named after Ralph Wiggum from The Simpsons. The loop continues until genuine completion (all stories pass), not an arbitrary iteration count.

## Find prd.json

<prd_files>
!`find . -name "prd.json" -path "*/ralph/*" 2>/dev/null | head -5 || echo "No prd.json found"`
</prd_files>

If $ARGUMENTS includes a path, use that. Otherwise, use `scripts/ralph/prd.json`.

## Design Reference (Optional)

Before starting, ask if user has a design reference:

Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Do you have a design reference to follow? I can extract the design system from it.",
    "header": "Design",
    "options": [
      {"label": "Website URL", "description": "Paste a URL to extract colours, typography, layout"},
      {"label": "Figma link", "description": "Extract design tokens from Figma"},
      {"label": "Screenshot", "description": "Analyse a screenshot for design patterns"},
      {"label": "No, use defaults", "description": "Continue with existing project styling"}
    ],
    "multiSelect": false
  }]
}
```

*If user provides reference:*
- **URL**: Use WebFetch to analyse and extract design system
- **Figma**: Use mcp__figma__get_figma_data to extract design tokens
- **Screenshot**: Analyse for colours, typography, spacing

Document extracted design system in `docs/design-system.md` for consistency across stories.

## Pre-Flight Checks

Before starting the loop, verify:

1. **prd.json exists and is valid**
   ```bash
   cat scripts/ralph/prd.json | jq '.userStories | length'
   ```

2. **Check remaining stories**
   ```bash
   cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length'
   ```

3. **Verify project structure**
   - Project has `package.json` with required scripts
   - `scripts/ralph/progress.txt` exists (create if not)

## Initialize Build Log

Create or update `scripts/ralph/build-log.json`:

```bash
TOTAL_STORIES=$(cat scripts/ralph/prd.json | jq '.userStories | length')
BUILD_LOG="scripts/ralph/build-log.json"

if [ ! -f "$BUILD_LOG" ]; then
    echo "{
  \"startedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"completedAt\": null,
  \"totalStories\": $TOTAL_STORIES,
  \"storiesCompleted\": 0,
  \"iterations\": 0,
  \"stories\": []
}" > "$BUILD_LOG"
fi
```

## Determine Iterations

Parse from $ARGUMENTS or calculate:
- If argument is a number, use that as max iterations
- Otherwise: `remaining_stories × 1.5` (rounded up, minimum 10)

## Start Ralph Wiggum Loop

Use the `/ralph-loop` command from the Ralph Wiggum plugin:

```bash
/ralph-loop "$(cat <<'PROMPT'
# Ralph Iteration

You are in a Ralph Wiggum autonomous loop.

## Current Status
```bash
cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | {remaining: length, next: .[0]}'
```

## Your Job (ONE story only)

1. Read `scripts/ralph/prd.json`
2. Find the **highest priority** story where `passes: false`
3. Check `scripts/ralph/build-log.json` for this story's attempt count
4. Implement **ONLY** that one story
5. Run checks:
   ```bash
   npm run typecheck
   npm run lint
   npm run test 2>/dev/null || true
   ```
6. For frontend stories: Verify in browser
7. If ALL checks pass:
   ```bash
   git add .
   git commit -m "feat([scope]): [what you did]"
   ```
   Then:
   - Update `scripts/ralph/prd.json`: set that story's `passes: true`
   - Update `scripts/ralph/build-log.json`: add story entry with attempts and status
8. If checks FAIL:
   - Update `scripts/ralph/build-log.json`: increment attempts for this story
   - Fix the issues and retry
9. Add learnings to `scripts/ralph/progress.txt`

## Build Log Updates

When completing a story, add to build-log.json stories array:
```json
{
  "id": "story-id",
  "title": "Story title",
  "attempts": 1,
  "status": "completed",
  "completedAt": "ISO timestamp"
}
```

When a story fails checks, increment its attempts count.

## Rules
- **ONE** story per iteration
- Commit after completing each story
- Track attempts in build-log.json
- If stuck >5 min, add notes and continue
- Never modify stories with `passes: true`

## Completion Check

After completing a story, check if ALL stories are done:
```bash
REMAINING=$(cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length')
echo "Remaining stories: $REMAINING"
```

**If REMAINING is 0**:
1. Update build-log.json with completedAt timestamp
2. Output: <promise>BUILD_COMPLETE</promise>

Otherwise, continue to next story.
PROMPT
)" --max-iterations [calculated] --completion-promise "BUILD_COMPLETE"
```

## Monitor Progress

During the loop, progress can be tracked via:

```bash
# Check story status
cat scripts/ralph/prd.json | jq '.userStories[] | {id, title, passes}'

# Check build stats
cat scripts/ralph/build-log.json | jq '{iterations, stories: [.stories[] | {title, attempts}]}'

# See git commits
git log --oneline -10

# Read progress notes
cat scripts/ralph/progress.txt

# Check Ralph loop state
head -10 .claude/ralph-loop.local.md
```

## Completion

When all stories pass, the completion promise triggers and the loop ends.

```markdown
## 🎉 Build Complete!

| Metric | Value |
|--------|-------|
| Stories Completed | [N]/[total] |
| Iterations Used | [N] |
| First-try Success | [N]% |
| Avg Attempts/Story | [N] |

### Story Breakdown
| Story | Attempts | Status |
|-------|----------|--------|
| Setup Next.js | 1 | ✅ |
| Auth login | 2 | ✅ |
| Dashboard | 1 | ✅ |

### Efficiency
- **First-try stories**: [N] (passed on first attempt)
- **Retry stories**: [N] (needed fixes)

### Next Steps
```bash
/review              # Code review
/project-complete    # Generate docs
/deploy-check        # Pre-deployment
```
```

## If Build Pauses or Hits Max Iterations

```markdown
## ⚠️ Build Paused

**Completed**: [N] stories
**Remaining**: [N] stories

### Resume
```bash
/build 20    # Run 20 more iterations
```

### Or Complete Manually
```bash
/implement [feature-name]
```

### Check Status
```bash
cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | {remaining: length, stories: [.[].title]}'
```
```

## Cancelling

To stop the loop early:

```bash
/cancel-ralph
```

Or delete the state file:
```bash
rm .claude/ralph-loop.local.md
```
