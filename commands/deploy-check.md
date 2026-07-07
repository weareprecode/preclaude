---
description: Pre-deployment verification checklist
allowed-tools: Read, Bash(*), Glob
---

# Pre-Deployment Check

Run all verification steps before deploying.

## Package Manager Detection

<package_manager>
!`if [ -f "bun.lockb" ]; then echo "bun"; elif [ -f "pnpm-lock.yaml" ]; then echo "pnpm"; elif [ -f "yarn.lock" ]; then echo "yarn"; else echo "npm"; fi`
</package_manager>

Use the detected package manager (stored in `<package_manager>`) for all commands below. Replace `npm` with the detected value.

## 1. Git Status

<branch>
!`git branch --show-current 2>/dev/null || echo "Not in git repo"`
</branch>

<status>
!`git status --short 2>/dev/null || echo "Not in git repo"`
</status>

<unpushed>
!`git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1 && git log @{u}..HEAD --oneline 2>/dev/null || echo "No upstream configured"`
</unpushed>

### Verify
- [ ] On correct branch (main, release/*, or deploy branch)
- [ ] Working directory clean (no uncommitted changes)
- [ ] All commits pushed to remote

---

## 2. Code Quality

### Linting
<lint>
!`npm run lint 2>&1 || echo "Lint script not found"`
</lint>

### Type Checking
<typecheck>
!`npm run tsc --noEmit 2>&1 || npx tsc --noEmit 2>&1 || echo "TypeScript not configured"`
</typecheck>

### Verify
- [ ] No linting errors
- [ ] No type errors

---

## 3. Tests

### Unit Tests
<unit_tests>
!`npm run test 2>&1 | tail -30 || echo "Test script not found"`
</unit_tests>

### E2E Tests (if available)
<e2e_tests>
!`npm run test:e2e 2>&1 | tail -20 || echo "No E2E tests configured"`
</e2e_tests>

### Verify
- [ ] All unit tests passing
- [ ] All E2E tests passing (if applicable)
- [ ] Test coverage acceptable

---

## 4. Build

<build>
!`npm run build 2>&1 | tail -30 || echo "Build script not found"`
</build>

### Verify
- [ ] Build completes without errors
- [ ] Bundle size acceptable
- [ ] No build warnings (or understood/acceptable)

---

## 5. Environment

### Check env example
<env_example>
!`cat .env.example 2>/dev/null || echo "No .env.example"`
</env_example>

### Verify
- [ ] All required env vars documented in .env.example
- [ ] Production env vars are set in deployment platform
- [ ] No secrets in codebase

---

## 6. Dependencies

### Security Audit
<audit>
!`npm audit 2>&1 | tail -20 || echo "Audit not available"`
</audit>

### Outdated
<outdated>
!`npm outdated 2>&1 | head -20 || echo "All up to date"`
</outdated>

### Verify
- [ ] No critical/high vulnerabilities (or acknowledged)
- [ ] Dependencies reasonably current

---

## 7. Database (if applicable)

### Verify
- [ ] Migrations are up to date
- [ ] No pending migrations to run
- [ ] Backup strategy in place

---

## 8. Documentation

### Verify
- [ ] README is current
- [ ] CHANGELOG updated (if maintained)
- [ ] API docs current (if public API)

---

## Summary

```
DEPLOYMENT READINESS CHECK
==========================

Git:          [✅/❌] [details]
Lint:         [✅/❌] [details]
Types:        [✅/❌] [details]
Tests:        [✅/❌] [details]
Build:        [✅/❌] [details]
Env:          [✅/❌] [details]
Security:     [✅/❌] [details]
Docs:         [✅/❌] [details]

─────────────────────────────
RESULT: [READY TO DEPLOY / BLOCKERS FOUND]

[If blockers, list specific items to fix]
```

## Quick Fixes

If issues found, common fixes:
- Lint: `$PM run lint -- --fix` (where $PM is the detected package manager)
- Types: Check error files, fix type annotations
- Tests: `$PM run test -- --watch` to debug
- Build: Check for missing imports, env vars
