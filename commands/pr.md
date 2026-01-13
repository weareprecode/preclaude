---
description: Create pull request from current branch with auto-generated description
allowed-tools: Read, Bash, Glob, Grep
model: opus
argument-hint: [base-branch]
---

# Create Pull Request

Generate a well-structured pull request from the current branch.

## Phase 1: Gather Context

```bash
# Get current branch
git branch --show-current

# Get base branch (default: main)
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main"

# Check if we need to push
git status -sb

# Get commits since branching from base
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
git log --oneline $(git merge-base HEAD origin/$BASE_BRANCH 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD 2>/dev/null || git log --oneline -10
```

## Phase 2: Analyse Changes

```bash
# Get diff stats
BASE_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
git diff --stat origin/$BASE_BRANCH...HEAD 2>/dev/null || git diff --stat $(git rev-parse --short HEAD~5 2>/dev/null || git rev-list --max-parents=0 HEAD) 2>/dev/null || echo "No diff available"

# Get changed files by type
git diff --name-only origin/$BASE_BRANCH...HEAD 2>/dev/null || git diff --name-only $(git rev-parse --short HEAD~5 2>/dev/null || git rev-list --max-parents=0 HEAD) 2>/dev/null | head -20 || echo "No files changed"
```

### Categorise Changes

Group files by type:
- **Features**: New components, pages, API routes
- **Fixes**: Bug fixes, error handling
- **Refactor**: Code improvements, no behaviour change
- **Tests**: New or updated tests
- **Docs**: Documentation changes
- **Config**: Build, CI, dependencies

## Phase 3: Generate PR

### Determine PR Type

Based on commits and changes:
- `feat:` commits → Feature PR
- `fix:` commits → Bug Fix PR
- `refactor:` commits → Refactor PR
- Mixed → Feature PR (default)

### Generate Title

From commits, create a concise title:
- If single commit: Use commit message
- If multiple: Summarise the main change

### Generate Description

```markdown
## Summary
[2-3 bullet points describing what this PR does]

## Changes
- [Specific change 1]
- [Specific change 2]
- [Specific change 3]

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Types check (`npm run typecheck`)
- [ ] Manually tested in browser

## Screenshots
[If UI changes, add before/after screenshots]

---
🤖 Generated with [Claude Code](https://claude.ai/claude-code)
```

## Phase 4: Create PR

### Push if Needed

```bash
# Check if branch is pushed
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "not-pushed"

# Push with upstream tracking if needed
git push -u origin $(git branch --show-current)
```

### Create via GitHub CLI

```bash
gh pr create --title "[PR title]" --body "$(cat <<'EOF'
## Summary
[summary bullets]

## Changes
[change list]

## Type of Change
- [x] [type]

## Testing
- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Types check
- [ ] Manually tested

---
🤖 Generated with [Claude Code](https://claude.ai/claude-code)
EOF
)"
```

### If gh CLI Not Available

Provide manual instructions:

```markdown
## Manual PR Creation

1. Push your branch:
   ```bash
   git push -u origin [branch-name]
   ```

2. Open: https://github.com/[owner]/[repo]/compare/main...[branch-name]

3. Use this description:
   [pre-filled description]
```

## Phase 5: Output

```markdown
## ✅ Pull Request Created

**Title**: [title]
**Branch**: [branch] → [base]
**URL**: [pr-url]

### Summary
[summary of changes]

### Files Changed
- [N] files changed
- [+N] additions
- [-N] deletions

### Next Steps
- [ ] Request reviewers
- [ ] Add labels if needed
- [ ] Link to related issues
```
