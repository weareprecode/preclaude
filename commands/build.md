---
description: Run Ralph autonomous build loop on existing prd.json (uses Ralph Wiggum plugin)
allowed-tools: Read, Write, Edit, Bash(*), Glob, Grep
model: opus
argument-hint: [iterations] [path-to-prd.json]
---

# Build with Ralph Wiggum

Execute the Ralph Wiggum autonomous build loop on an existing `prd.json`.

## Philosophy

> "Ralph is a Bash loop" - Geoffrey Huntley

Named after Ralph Wiggum from The Simpsons. The loop continues until genuine completion (all stories pass), not an arbitrary iteration count.

## Choose Ralph Mode

Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Which Ralph mode do you want to use?",
    "header": "Ralph mode",
    "options": [
      {"label": "Same context (Recommended)", "description": "Faster, Claude remembers previous work. Best for <15 stories."},
      {"label": "Fresh context", "description": "Clean slate each story. Best for 20+ stories or overnight builds."}
    ],
    "multiSelect": false
  }]
}
```

**If "Same context"**: Continue to "Start Ralph Wiggum Loop" section below.
**If "Fresh context"**: Skip to "Fresh Context Mode" section at the end.

## Find prd.json

<prd_files>
!`find . -name "prd.json" -path "*/ralph/*" 2>/dev/null | head -5 || echo "No prd.json found"`
</prd_files>

If $ARGUMENTS includes a path, use that. Otherwise, use `scripts/ralph/prd.json`.

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

## AUTONOMY RULES (CRITICAL)

You are in an AUTONOMOUS loop. This means:

1. **NEVER ask for user confirmation** - Just do the work
2. **NEVER stop to report progress** - The loop handles reporting
3. **NEVER ask "should I continue?"** - Always continue to next story
4. **NEVER output a summary and wait** - Keep working
5. **Only stop when ALL stories pass** - Then output the completion promise

The user has explicitly requested autonomous execution. Stopping to ask questions defeats the entire purpose. If you're unsure about something, make a reasonable decision and document it in progress.txt.

After completing a story, IMMEDIATELY check for the next story and start implementing it. Do not pause between stories.

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

---

## Fresh Context Mode

> Original Ralph Wiggum - each story gets a fresh context window.

When user selects "Fresh context", generate and run `scripts/ralph/ralph-loop.sh`:

### 1. Generate the Loop Script

```bash
mkdir -p scripts/ralph
cat > scripts/ralph/ralph-loop.sh << 'SCRIPT'
#!/bin/bash
# Original Ralph - Fresh context per iteration

PRD_PATH="${1:-scripts/ralph/prd.json}"
MAX_ITERATIONS="${2:-50}"
LOG_FILE="scripts/ralph/ralph.log"

mkdir -p scripts/ralph
: > "$LOG_FILE"

echo "🔄 Ralph (fresh context) started at $(date)" | tee -a "$LOG_FILE"
echo "PRD: $PRD_PATH | Max iterations: $MAX_ITERATIONS" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

for ((i=1; i<=MAX_ITERATIONS; i++)); do
    REMAINING=$(jq '[.userStories[] | select(.passes == false)] | length' "$PRD_PATH" 2>/dev/null || echo "?")

    if [[ "$REMAINING" == "0" ]]; then
        echo "✅ ALL STORIES COMPLETE!" | tee -a "$LOG_FILE"
        echo "Finished at $(date)" | tee -a "$LOG_FILE"
        exit 0
    fi

    NEXT=$(jq -r '[.userStories[] | select(.passes == false)][0].title // "?"' "$PRD_PATH" 2>/dev/null)
    echo "═══════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"
    echo "🔄 Iteration $i/$MAX_ITERATIONS - $NEXT" | tee -a "$LOG_FILE"
    echo "   Remaining: $REMAINING stories | $(date)" | tee -a "$LOG_FILE"
    echo "═══════════════════════════════════════════════════════════" | tee -a "$LOG_FILE"

    claude --print "$(cat <<PROMPT
# Ralph Iteration $i

Read scripts/ralph/prd.json and implement the NEXT story where passes: false.

## Rules
1. ONE story only - the highest priority with passes: false
2. Run typecheck, lint, test after implementation
3. If ALL pass: git commit and set passes: true in prd.json
4. Update scripts/ralph/progress.txt with learnings
5. NEVER ask for confirmation - just do the work

Current remaining: $REMAINING stories
PROMPT
)" 2>&1 | tee -a "$LOG_FILE"

    echo "" | tee -a "$LOG_FILE"
done

echo "⚠️ Max iterations ($MAX_ITERATIONS) reached" | tee -a "$LOG_FILE"
SCRIPT
chmod +x scripts/ralph/ralph-loop.sh
```

### 2. Run in Background

```bash
# Calculate iterations
REMAINING=$(jq '[.userStories[] | select(.passes == false)] | length' scripts/ralph/prd.json 2>/dev/null || echo 10)
MAX_ITER=$((REMAINING * 2))
[[ $MAX_ITER -lt 10 ]] && MAX_ITER=10

# Run in background
nohup scripts/ralph/ralph-loop.sh scripts/ralph/prd.json $MAX_ITER > /dev/null 2>&1 &
echo "Ralph PID: $!"
```

### 3. Output to User

```markdown
## 🔄 Ralph (Fresh Context) Started

**Mode**: Fresh context per iteration
**Stories**: [N] remaining
**Max iterations**: [N]

### Monitor Progress
```bash
tail -f scripts/ralph/ralph.log    # Live output
cat scripts/ralph/prd.json | jq '[.userStories[] | {title, passes}]'  # Story status
```

### Stop the Build
```bash
pkill -f ralph-loop.sh
```
```
