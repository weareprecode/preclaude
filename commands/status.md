---
description: Quick project health check - git, lint, types, tests in one view
allowed-tools: Bash
model: haiku
---

# Project Status

Quick health check showing git status, linting, types, and tests.

## Run All Checks

Run checks in sequence and report:

```bash
echo "═══════════════════════════════════════════════════════════════"
echo "📊 PROJECT STATUS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Detect package manager
if [ -f "bun.lockb" ]; then PM="bun"
elif [ -f "pnpm-lock.yaml" ]; then PM="pnpm"
elif [ -f "yarn.lock" ]; then PM="yarn"
else PM="npm"
fi

# Git Status
echo "📁 GIT"
echo "───────────────────────────────────────────────────────────────"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "detached")
  echo "Branch: $BRANCH"
  if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
    AHEAD=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")
    BEHIND=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "0")
    echo "Ahead/Behind: +$AHEAD / -$BEHIND"
  else
    echo "Ahead/Behind: no upstream configured"
  fi
  UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  echo "Uncommitted: $UNCOMMITTED files"
else
  echo "Not a git repository"
fi
echo ""

# Typecheck
echo "📝 TYPECHECK"
echo "───────────────────────────────────────────────────────────────"
if $PM run typecheck --silent 2>/dev/null; then
  echo "✅ Types OK"
else
  echo "❌ Type errors found"
fi
echo ""

# Lint
echo "🔍 LINT"
echo "───────────────────────────────────────────────────────────────"
if $PM run lint --silent 2>/dev/null; then
  echo "✅ Lint OK"
else
  echo "❌ Lint errors found"
fi
echo ""

# Tests
echo "🧪 TESTS"
echo "───────────────────────────────────────────────────────────────"
if $PM run test --silent 2>/dev/null; then
  echo "✅ Tests pass"
else
  echo "❌ Test failures"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
```

## Output Format

```markdown
═══════════════════════════════════════════════════════════════
📊 PROJECT STATUS
═══════════════════════════════════════════════════════════════

📁 GIT
───────────────────────────────────────────────────────────────
Branch: feature/new-feature
Ahead/Behind: +3 / -0
Uncommitted: 2 files

📝 TYPECHECK
───────────────────────────────────────────────────────────────
✅ Types OK

🔍 LINT
───────────────────────────────────────────────────────────────
✅ Lint OK

🧪 TESTS
───────────────────────────────────────────────────────────────
✅ Tests pass

═══════════════════════════════════════════════════════════════
```

## If Issues Found

Show brief summary of what needs fixing:

```markdown
## ⚠️ Issues Found

### Type Errors (3)
Run `npm run typecheck` to see details

### Lint Errors (5)
Run `npm run lint` to see details
Run `npm run lint:fix` to auto-fix

### Test Failures (2)
Run `npm run test` to see details
```
