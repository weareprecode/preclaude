---
description: Run Ralph autonomous build loop on existing prd.json
allowed-tools: Read, Write, Edit, Bash(*), Glob, Grep
model: opus
argument-hint: [iterations] [path-to-prd.json]
---

# Build with Ralph

Execute the Ralph autonomous build loop on an existing `prd.json`.

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
   - `scripts/ralph/prompt.md` exists
   - `scripts/ralph/progress.txt` exists
   - Project has `package.json` with required scripts

## If Missing ralph.sh or prompt.md

Create them using the templates from `/full-build`:

### scripts/ralph/ralph.sh
```bash
#!/bin/bash
set -e

MAX_ITERATIONS=${1:-30}
ITERATION=0
BUILD_LOG="scripts/ralph/build-log.json"
TOTAL_STORIES=$(cat scripts/ralph/prd.json | jq '.userStories | length')

# Initialize build log if not exists
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

echo ""
echo "🤖 RALPH AUTONOMOUS BUILD"
echo "═══════════════════════════════════════════════════════════════════"
echo "Iterations: $MAX_ITERATIONS max"
echo "Stories:    $TOTAL_STORIES total"
echo "Remaining:  $(cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length')"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))

    REMAINING=$(cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length')

    if [ "$REMAINING" = "0" ]; then
        # Update build log completion
        jq --arg time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
           --arg iterations "$ITERATION" \
           '.completedAt = $time | .iterations = ($iterations | tonumber)' \
           "$BUILD_LOG" > tmp.json && mv tmp.json "$BUILD_LOG"

        COMPLETED=$(jq '[.stories[] | select(.status == "completed")] | length' "$BUILD_LOG")
        FIRST_TRY=$(jq '[.stories[] | select(.attempts == 1)] | length' "$BUILD_LOG")

        echo ""
        echo "═══════════════════════════════════════════════════════════════════"
        echo "🎉 ALL STORIES COMPLETE!"
        echo "───────────────────────────────────────────────────────────────────"
        echo "  Stories:     $COMPLETED/$TOTAL_STORIES"
        echo "  Iterations:  $ITERATION"
        echo "  First-try:   $FIRST_TRY stories ($(( FIRST_TRY * 100 / COMPLETED ))%)"
        echo "═══════════════════════════════════════════════════════════════════"
        exit 0
    fi

    echo "───────────────────────────────────────────────────────────────────"
    echo "  Iteration $ITERATION/$MAX_ITERATIONS | Remaining: $REMAINING stories"
    echo "───────────────────────────────────────────────────────────────────"

    claude -p "$(cat scripts/ralph/prompt.md)"

    # Update iteration count in build log
    jq --arg iterations "$ITERATION" '.iterations = ($iterations | tonumber)' \
       "$BUILD_LOG" > tmp.json && mv tmp.json "$BUILD_LOG"

    sleep 2
done

echo "⚠️  MAX ITERATIONS REACHED ($MAX_ITERATIONS)"
echo "Check build-log.json for story breakdown"
```

### scripts/ralph/prompt.md
```markdown
# Ralph Iteration

You are in a Ralph autonomous loop.

## Your Job (ONE story only)

1. Read `scripts/ralph/prd.json`
2. Find the **highest priority** story where `passes: false`
3. Check `scripts/ralph/build-log.json` for this story's attempt count
4. Implement **ONLY** that one story
5. Run checks:
   ```bash
   npm run typecheck
   npm run lint
   npm run test  # if tests exist
   ```
6. For frontend stories: Verify in browser
7. If ALL checks pass:
   ```bash
   git add .
   git commit -m "feat([scope]): [what you did]"
   ```
   Then:
   - Update `scripts/ralph/prd.json`: set that story's `passes: true`
   - Update `scripts/ralph/build-log.json`: add/update story entry with attempts and status
8. If checks FAIL:
   - Update `scripts/ralph/build-log.json`: increment attempts for this story
   - Fix the issues and retry
9. Add learnings to `scripts/ralph/progress.txt`

## Build Log Updates

When completing a story, add to build-log.json:
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
```

## Determine Iterations

Parse from $ARGUMENTS or calculate:
- If argument is a number, use that
- Otherwise: `remaining_stories × 1.5` (rounded up)

## Start the Loop

```markdown
## 🤖 Starting Ralph Build

| Metric | Value |
|--------|-------|
| Total Stories | [N] |
| Remaining | [N] |
| Iterations | [calculated] |

### Status
```bash
cat scripts/ralph/prd.json | jq '.userStories[] | {id, title, passes}'
```

Starting autonomous loop...
```

### Execute

If `ralph.sh` exists:
```bash
./scripts/ralph/ralph.sh [iterations]
```

Otherwise, run the loop inline by repeatedly:

1. Reading `scripts/ralph/prd.json`
2. Finding next incomplete story
3. Implementing it
4. Running quality checks
5. Committing on success
6. Updating prd.json
7. Repeat until done or max iterations

## Track Progress

After each story, update `scripts/ralph/build-log.json`:

```json
{
  "startedAt": "2024-01-15T10:00:00Z",
  "completedAt": null,
  "totalStories": 33,
  "storiesCompleted": 0,
  "iterations": 0,
  "stories": [
    {
      "id": "story-1",
      "title": "Setup Next.js project",
      "attempts": 1,
      "status": "completed",
      "completedAt": "2024-01-15T10:05:00Z"
    }
  ]
}
```

**Track per story:**
- `attempts` - How many iterations it took (1 = first try, 2+ = needed fixes)
- `status` - "completed", "in_progress", "failed"

## Completion

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
- **Failed stories**: [N] (exceeded attempts)

### Next Steps
```bash
/review              # Code review
/project-complete    # Generate docs
/deploy-check        # Pre-deployment
```
```

## If Build Fails or Partial

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
