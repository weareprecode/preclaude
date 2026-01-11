---
description: Convert PRD to prd.json format for autonomous Ralph execution
allowed-tools: Read, Write, Glob
model: opus
argument-hint: [path-to-prd]
---

# Convert PRD to Ralph Format

Convert a PRD document to `prd.json` for autonomous execution.

## Find PRD

<prd_files>
!`find docs/prd -name "*.md" 2>/dev/null | head -5 || echo "No PRD files found"`
</prd_files>

If $ARGUMENTS provided, use that file. Otherwise, use the most recent PRD.

## Process

Load and follow the Ralph skill methodology:

1. Analyze the PRD for all features/requirements
2. Break into small, atomic user stories
3. Each story must be completable in ONE context window
4. Order by dependencies (schema → API → UI → integration)
5. Write checkable acceptance criteria
6. Include quality check criteria (typecheck, tests)
7. Add "Verify in browser using dev-browser skill" for frontend stories

## Size Check

For each story, verify:
- Can describe in 2-3 sentences? ✅
- Single clear deliverable? ✅
- ~30 min focused work? ✅

If any story is too big, break it down further.

## Output

Create: `scripts/ralph/prd.json`

Also create `scripts/ralph/` directory structure if it doesn't exist.

## After Completion

```markdown
## Ralph Conversion Complete

**Project**: [Name]
**Branch**: ralph/[feature]
**Stories**: [N] user stories

### Ready to Execute
```bash
# Start Ralph loop (default 10 iterations)
./scripts/ralph/ralph.sh

# Or with custom max iterations
./scripts/ralph/ralph.sh 25
```

### Monitor Progress
```bash
cat scripts/ralph/prd.json | jq '.userStories[] | {id, title, passes}'
```
```
