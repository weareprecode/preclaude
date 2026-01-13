---
description: Comprehensive code review of staged or recent changes
allowed-tools: Read, Bash(git:*), Glob, Grep
model: opus
---

# Code Review

## Gather Changes

<staged_diff>
!`git diff --cached 2>/dev/null || echo "Nothing staged"`
</staged_diff>

<unstaged_diff>
!`git diff 2>/dev/null | head -200 || echo "No unstaged changes"`
</unstaged_diff>

<changed_files>
!`git diff --name-only HEAD~1 2>/dev/null || git diff --cached --name-only 2>/dev/null || git status --porcelain | cut -c4-`
</changed_files>

## Review Checklist

Evaluate changes against these criteria:

### 1. Correctness
- [ ] Logic is correct and handles edge cases
- [ ] No obvious bugs or runtime errors
- [ ] Error handling is appropriate
- [ ] Async operations handled correctly

### 2. Security
- [ ] No secrets or credentials in code
- [ ] User input is validated/sanitized
- [ ] SQL injection / XSS prevention
- [ ] Auth checks in place where needed
- [ ] No sensitive data logged

### 3. Performance
- [ ] No N+1 queries
- [ ] Appropriate use of caching
- [ ] No memory leaks (event listeners, subscriptions)
- [ ] Large lists are paginated/virtualized

### 4. Code Quality
- [ ] Follows project conventions
- [ ] DRY — no unnecessary duplication
- [ ] Functions are focused (single responsibility)
- [ ] Names are clear and descriptive
- [ ] No dead code or commented-out blocks

### 5. TypeScript
- [ ] No `any` types (unless justified)
- [ ] Proper null/undefined handling
- [ ] Interfaces for object shapes
- [ ] Generic types used appropriately

### 6. Testing
- [ ] New code has tests
- [ ] Edge cases covered
- [ ] Tests are meaningful (not just coverage)
- [ ] Mocks are appropriate

### 7. Documentation
- [ ] Complex logic has comments
- [ ] Public APIs documented
- [ ] README updated if needed

## Output Format

```
CODE REVIEW
===========

Files reviewed: [N]

🔴 BLOCKERS (must fix):
-----------------------
[File:Line] [Issue description]
  Problem: [What's wrong]
  Fix: [Suggested solution]

🟡 SUGGESTIONS (should consider):
---------------------------------
[File:Line] [Issue description]
  Why: [Reasoning]
  Alternative: [Suggested approach]

🟢 GOOD PATTERNS (worth noting):
--------------------------------
- [Positive observation]

📊 SUMMARY:
-----------
Blockers: [N]
Suggestions: [N]
Overall: [APPROVE / REQUEST CHANGES / NEEDS DISCUSSION]

[If REQUEST CHANGES, list specific items to address]
```

## Review Guidelines

- Be specific — file, line, and concrete suggestion
- Explain WHY, not just WHAT
- Distinguish blocking issues from preferences
- Acknowledge good patterns, not just problems
- Consider the context — is this a quick fix or production code?
