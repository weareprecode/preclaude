---
description: Update Preclaude to the latest version
allowed-tools: Bash(git:*), Bash(ls:*)
model: haiku
---

# Update Preclaude

Update Preclaude to the latest version from GitHub.

## Check Installation

<preclaude_dir>
!`ls -la ~/.preclaude 2>/dev/null | head -5 || echo "NOT INSTALLED"`
</preclaude_dir>

If `<preclaude_dir>` shows "NOT INSTALLED":

```
Preclaude is not installed at ~/.preclaude

Install with:
curl -fsSL https://preclaude.dev/install.sh | bash
```

## Current Version

<current_commit>
!`git -C ~/.preclaude log --oneline -1 2>/dev/null || echo "Unknown"`
</current_commit>

<current_branch>
!`git -C ~/.preclaude branch --show-current 2>/dev/null || echo "Unknown"`
</current_branch>

## Fetch Updates

<fetch>
!`git -C ~/.preclaude fetch origin 2>&1 || echo "Fetch failed"`
</fetch>

<behind_count>
!`git -C ~/.preclaude rev-list HEAD..origin/main --count 2>/dev/null || echo "0"`
</behind_count>

## Apply Updates

If `<behind_count>` > 0:

<pull>
!`git -C ~/.preclaude pull origin main 2>&1 || echo "Pull failed"`
</pull>

<new_commits>
!`git -C ~/.preclaude log --oneline HEAD@{1}..HEAD 2>/dev/null | head -10 || echo "No new commits"`
</new_commits>

## Verify Symlinks

<symlinks>
!`ls -la ~/.claude/commands 2>/dev/null | head -1 && ls -la ~/.claude/agents 2>/dev/null | head -1 || echo "Symlinks not found"`
</symlinks>

If symlinks are broken, recreate them:

```bash
ln -sfn ~/.preclaude/commands ~/.claude/commands
ln -sfn ~/.preclaude/agents ~/.claude/agents
```

## Output

```
PRECLAUDE UPDATE
================

Branch: [branch]
Previous: [old commit hash]
Current:  [new commit hash]

Updates:
- [commit 1]
- [commit 2]
- [commit 3]

Symlinks: [OK / Fixed / Missing]

✅ Preclaude is up to date
```

If already up to date:

```
PRECLAUDE UPDATE
================

✅ Already on latest version ([commit hash])
```
