#!/usr/bin/env bash
# Stop hook: block finishing a turn when source changed but memory/ did not.
# Nudges once per stop (stop_hook_active guard) so it can never loop.
set -u

input="$(cat)"
case "$input" in
  *'"stop_hook_active":true'*|*'"stop_hook_active": true'*) exit 0 ;;
esac

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[ -n "$root" ] || exit 0
cd "$root" || exit 0

# Compare against the merge-base with main so committed-but-unmerged work counts.
base="$(git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD main 2>/dev/null || echo HEAD)"
changed="$( { git diff --name-only "$base" 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null; } | sort -u )"
[ -n "$changed" ] || exit 0

# Source = anything outside memory/, docs/, .claude/, .github/ that is not a top-level markdown file.
source_changed="$(printf '%s\n' "$changed" | grep -Ev '^(memory|docs|\.claude|\.github)/' | grep -Ev '^[^/]+\.md$' || true)"
memory_changed="$(printf '%s\n' "$changed" | grep -E '^memory/' || true)"

if [ -n "$source_changed" ] && [ -z "$memory_changed" ]; then
  cat <<'JSON'
{"decision":"block","reason":"Source changed but nothing under memory/ did. Before finishing: write a memory record with /remember (Context, Options considered, Decision, Consequences, Still owed, Evidence), append its INDEX line, and rewrite memory/NOW.md if what is in flight or owed has changed. If this change genuinely needs no record, say so to the user in one line and stop."}
JSON
fi
exit 0
