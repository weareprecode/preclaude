---
description: Convert PRD to prd.json format for autonomous build execution
allowed-tools: Read, Write, Glob
model: opus
argument-hint: [path-to-prd]
---

# Convert PRD to JSON Format

Convert a PRD document to `prd.json` for autonomous build execution with `/build`.

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
## PRD Conversion Complete

**Project**: [Name]
**Stories**: [N] user stories

### Ready to Build
```bash
# Start build with Ralph Wiggum
/build

# Or with custom max iterations
/build 25
```

### Monitor Progress
```bash
cat scripts/ralph/prd.json | jq '.userStories[] | {id, title, passes}'
```
```
