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

echo ""
echo "🤖 RALPH AUTONOMOUS BUILD"
echo "═══════════════════════════════════════════════════════════════════"
echo "Iterations: $MAX_ITERATIONS max"
echo "Stories:    $(cat scripts/ralph/prd.json | jq '.userStories | length') total"
echo "Remaining:  $(cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length')"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))

    REMAINING=$(cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length')

    if [ "$REMAINING" = "0" ]; then
        echo ""
        echo "═══════════════════════════════════════════════════════════════════"
        echo "🎉 ALL STORIES COMPLETE!"
        echo "═══════════════════════════════════════════════════════════════════"
        exit 0
    fi

    echo "───────────────────────────────────────────────────────────────────"
    echo "  Iteration $ITERATION/$MAX_ITERATIONS | Remaining: $REMAINING stories"
    echo "───────────────────────────────────────────────────────────────────"

    claude -p "$(cat scripts/ralph/prompt.md)"

    sleep 2
done

echo "⚠️  MAX ITERATIONS REACHED ($MAX_ITERATIONS)"
```

### scripts/ralph/prompt.md
```markdown
# Ralph Iteration

You are in a Ralph autonomous loop.

## Your Job (ONE story only)

1. Read `scripts/ralph/prd.json`
2. Find the **highest priority** story where `passes: false`
3. Implement **ONLY** that one story
4. Run checks:
   ```bash
   npm run typecheck
   npm run lint
   npm run test  # if tests exist
   ```
5. For frontend stories: Verify in browser
6. If ALL checks pass:
   ```bash
   git add .
   git commit -m "feat([scope]): [what you did]"
   ```
   Then update `scripts/ralph/prd.json`: set that story's `passes: true`
7. Add learnings to `scripts/ralph/progress.txt`

## Rules
- **ONE** story per iteration
- Commit after completing each story
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

## Completion

```markdown
## 🎉 Build Complete!

| Metric | Value |
|--------|-------|
| Stories Completed | [N] |
| Iterations Used | [N] |
| Time | ~[N] min |

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
