---
description: Execute full feature implementation from PRD through completion
allowed-tools: Read, Write, Edit, Bash(*), Glob, Grep
argument-hint: [feature-description]
---

# Implement Feature: $ARGUMENTS

Execute complete implementation workflow.

## Package Manager Detection

<package_manager>
!`if [ -f "bun.lockb" ]; then echo "bun"; elif [ -f "pnpm-lock.yaml" ]; then echo "pnpm"; elif [ -f "yarn.lock" ]; then echo "yarn"; else echo "npm"; fi`
</package_manager>

Use the detected package manager for all commands.

## Phase 1: Discovery

### Check for existing PRD
<prd_search>
!`find docs/prd -name "*.md" 2>/dev/null | head -5 || echo "No PRD directory"`
</prd_search>

### Check roadmap
<roadmap>
@reference/ROADMAP.md
</roadmap>

### Assess complexity
- **Small** (1-2 files): Implement directly
- **Medium** (3-5 files): Create task file first
- **Large** (6+ files): Create PRD and break into subtasks

## Phase 2: Planning (Medium/Large only)

### Create task file
Location: `docs/tasks/[NNN]-[feature-slug].md`

```markdown
# Task [NNN]: [Title]

## Status: In Progress

## Objective
[What this accomplishes]

## Requirements
- [ ] REQ-1: [Requirement]
- [ ] REQ-2: [Requirement]

## Technical Approach
[How we'll implement]

## Files to Create/Modify
- [ ] `path/to/file.ts` — [purpose]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Progress Log
### [Today's Date]
- Started implementation
```

### Update ROADMAP.md
Add task to "Active Development" section.

## Phase 3: Implementation

For each file:

### 3.1 Write Test First (TDD)
```typescript
describe('[Feature]', () => {
  it('should [expected behavior]', () => {
    // Arrange
    // Act  
    // Assert
  });
});
```

### 3.2 Implement Minimum to Pass
Write only enough code to make the test pass.

### 3.3 Refactor
Clean up while tests stay green.

### 3.4 Verify
```bash
npm run test -- --watch [test-file]
```

## Phase 4: Quality Gates

Run all checks before considering complete:

<lint>
!`npm run lint 2>&1 | tail -20`
</lint>

<typecheck>
!`npm run tsc --noEmit 2>&1 | tail -20`
</typecheck>

<tests>
!`npm run test 2>&1 | tail -30`
</tests>

### Fix any failures before proceeding

## Phase 5: Documentation

- [ ] Update relevant README sections
- [ ] Add/update API documentation if endpoints changed
- [ ] Update CLAUDE.md if gotchas discovered
- [ ] Update task file with completion notes

## Phase 6: Completion

### Update task status
```markdown
## Status: Complete ✅

## Completion Notes
- Implemented [summary]
- [Any deviations from plan]
- [Technical debt created, if any]
```

### Update ROADMAP.md
Move task from "Active" to "Completed".

### Output Summary
```
FEATURE IMPLEMENTED: $ARGUMENTS
================================

Files created: [N]
Files modified: [N]
Tests added: [N]

Quality:
✅ Lint passing
✅ Types passing  
✅ Tests passing ([N] new, [N] total)

Documentation updated:
- [List of docs changed]

Ready for: Code review / PR / Deploy
```
