#!/usr/bin/env bash
# Install the shared memory system into the current project. Idempotent:
# existing files are left alone, settings.json is merged, CLAUDE.md is appended
# only if it has no Memory section. Prints what it did.
set -euo pipefail
T="$(cd "$(dirname "${BASH_SOURCE[0]}")/templates" && pwd)"
root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$root"
did=()

put() { # put <template> <dest>
  if [ -e "$2" ]; then did+=("kept    $2"); else mkdir -p "$(dirname "$2")"; cp "$1" "$2"; did+=("created $2"); fi
}

put "$T/NOW.md"                     memory/NOW.md
put "$T/INDEX.md"                   memory/INDEX.md
mkdir -p memory/assets && touch memory/assets/.gitkeep
put "$T/remember/SKILL.md"          .claude/skills/remember/SKILL.md
put "$T/hooks/memory-check.sh"      .claude/hooks/memory-check.sh
chmod +x .claude/hooks/memory-check.sh
put "$T/workflows/memory.yml"       .github/workflows/memory.yml

# settings.json: merge the Stop hook in, or create.
if [ -f .claude/settings.json ]; then
  if jq -e '.hooks.Stop[]?.hooks[]? | select(.command | test("memory-check"))' .claude/settings.json >/dev/null 2>&1; then
    did+=("kept    .claude/settings.json (hook already present)")
  else
    jq -s '.[0] * {hooks: {Stop: ((.[0].hooks.Stop // []) + .[1].hooks.Stop)}}' .claude/settings.json "$T/settings.hooks.json" > .claude/settings.json.tmp
    mv .claude/settings.json.tmp .claude/settings.json
    did+=("merged  .claude/settings.json (Stop hook added)")
  fi
else
  mkdir -p .claude; cp "$T/settings.hooks.json" .claude/settings.json; did+=("created .claude/settings.json")
fi

# CLAUDE.md: append the Memory section unless one exists.
if [ -f CLAUDE.md ] && grep -q '^## Memory' CLAUDE.md; then
  did+=("kept    CLAUDE.md (Memory section present)")
else
  [ -f CLAUDE.md ] || { printf '# CLAUDE.md\n\n## What this is\n\n<fill in>\n' > CLAUDE.md; did+=("created CLAUDE.md"); }
  cat "$T/CLAUDE-memory-section.md" >> CLAUDE.md; did+=("appended Memory section to CLAUDE.md")
fi

# .gitattributes / .gitignore lines
grep -qs 'memory/INDEX.md merge=union' .gitattributes || { printf 'memory/INDEX.md merge=union\n' >> .gitattributes; did+=("appended .gitattributes"); }
grep -qs '^\.claude/settings\.local\.json' .gitignore || { { [ -s .gitignore ] && [ -n "$(tail -c1 .gitignore)" ] && printf '\n'; printf '.claude/settings.local.json\n'; } >> .gitignore; did+=("appended .gitignore"); }

# Verify
jq -e '.hooks.Stop[].hooks[] | select(.type=="command") | .command' .claude/settings.json >/dev/null || { echo "settings.json invalid" >&2; exit 1; }
out="$(echo '{"stop_hook_active":true}' | CLAUDE_PROJECT_DIR="$root" .claude/hooks/memory-check.sh)"
[ -z "$out" ] || { echo "hook guard failed" >&2; exit 1; }

printf '%s\n' "${did[@]}"
echo "verified: settings.json valid, hook guard silent"
