#!/bin/bash

# Preclaude Installer
# Symlinks this repo's pieces into ~/.claude for cross-project availability.
# Only the entries Preclaude owns are touched — the rest of ~/.claude
# (plugins, credentials, history, projects) is left alone.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$HOME/.claude"
BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"
ENTRIES=(commands skills agents CLAUDE.md settings.json settings.local.json)

echo "🤖 Preclaude Installer"
echo "======================"
echo ""
echo "Source: $SCRIPT_DIR"
echo "Target: $TARGET_DIR"
echo ""

# settings.local.json is not tracked in git — create from the example if missing
if [ ! -f "$SCRIPT_DIR/settings.local.json" ]; then
    cp "$SCRIPT_DIR/settings.example.json" "$SCRIPT_DIR/settings.local.json"
    echo "Created settings.local.json from settings.example.json"
fi

# Old-style install: ~/.claude itself was a symlink to the repo
if [ -L "$TARGET_DIR" ]; then
    echo "⚠️  ~/.claude is a directory symlink (old style) — converting to a real directory"
    rm "$TARGET_DIR"
fi

mkdir -p "$TARGET_DIR"

# Link each entry, backing up anything that's already there and isn't ours
BACKED_UP=0
for name in "${ENTRIES[@]}"; do
    src="$SCRIPT_DIR/$name"
    dest="$TARGET_DIR/$name"

    # Already linked correctly?
    if [ -L "$dest" ] && [ "$(readlink "$dest")" = "$src" ]; then
        continue
    fi

    # Something else is there — move just that entry aside
    if [ -e "$dest" ] || [ -L "$dest" ]; then
        mkdir -p "$BACKUP_DIR"
        mv "$dest" "$BACKUP_DIR/$name"
        BACKED_UP=1
    fi

    ln -s "$src" "$dest"
done

echo ""
echo "✅ Installed successfully!"
if [ "$BACKED_UP" = "1" ]; then
    echo ""
    echo "⚠️  Existing entries were moved to: $BACKUP_DIR"
    echo "   To restore one: mv \"$BACKUP_DIR/<name>\" \"$TARGET_DIR/<name>\""
fi
echo ""
echo "Your Claude Code sessions now have access to:"
echo "  • $(ls -1 "$SCRIPT_DIR/commands" 2>/dev/null | grep -c '\.md$') commands"
echo "  • $(ls -1 "$SCRIPT_DIR/skills" 2>/dev/null | wc -l | tr -d ' ') skills"
echo "  • $(ls -1 "$SCRIPT_DIR/agents" 2>/dev/null | grep -c '\.md$') agents"
echo ""
echo "Restart Claude Code, then test it: type /learn"
echo ""
echo "Prefer plugins? Preclaude also installs as a Claude Code plugin:"
echo "  /plugin marketplace add weareprecode/preclaude"
echo "  /plugin install preclaude@preclaude"
