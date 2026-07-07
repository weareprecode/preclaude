---
description: Create conventional commit from staged changes
allowed-tools: Bash(git:*)
model: haiku
---

# Conventional Commit Generator

<staged_changes>
!`git diff --cached 2>/dev/null || echo "Nothing staged"`
</staged_changes>

<staged_files>
!`git diff --cached --name-only 2>/dev/null || echo "No files staged"`
</staged_files>

<recent_commits>
!`git log --oneline -5 2>/dev/null || echo "No commits yet"`
</recent_commits>

## Instructions

Generate a commit message following Conventional Commits format:

### Types
- `feat`: New feature (correlates with MINOR in semver)
- `fix`: Bug fix (correlates with PATCH in semver)
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change that neither fixes nor adds
- `perf`: Performance improvement
- `test`: Adding or correcting tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `build`: Build system changes

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Rules
- Description: imperative mood, lowercase, no period, max 50 chars
- Scope: component or area affected (optional but encouraged)
- Body: wrap at 72 chars, explain WHAT and WHY
- Breaking changes: add `!` after type or `BREAKING CHANGE:` in footer

## If $ARGUMENTS provided
Use as commit message directly (validate format first).

## If no $ARGUMENTS
Analyze the diff and generate appropriate message.

## Output
```bash
git commit -m "<generated message>"
```

Ask for confirmation before executing.
