#!/bin/bash
#
# Preclaude Remote Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash
#
# Only the entries Preclaude owns are touched — the rest of ~/.claude
# (plugins, credentials, history, projects) is left alone.

set -e

REPO_URL="https://github.com/weareprecode/preclaude.git"
INSTALL_DIR="$HOME/.preclaude"
TARGET_DIR="$HOME/.claude"
BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"
ENTRIES=(commands skills agents CLAUDE.md settings.json settings.local.json)

echo ""
echo "  Preclaude Installer"
echo "  ==================="
echo ""

# Check for git
if ! command -v git &> /dev/null; then
    echo "Error: git is required but not installed."
    echo "Install git first: https://git-scm.com/downloads"
    exit 1
fi

# Clone or update repo
if [ -d "$INSTALL_DIR" ]; then
    echo "Updating existing installation..."
    git -C "$INSTALL_DIR" pull --quiet
else
    echo "Cloning preclaude..."
    git clone --quiet "$REPO_URL" "$INSTALL_DIR"
fi

# settings.local.json is not tracked in git — create from the example if missing
if [ ! -f "$INSTALL_DIR/settings.local.json" ]; then
    cp "$INSTALL_DIR/settings.example.json" "$INSTALL_DIR/settings.local.json"
fi

# Old-style install: ~/.claude itself was a symlink
if [ -L "$TARGET_DIR" ]; then
    rm "$TARGET_DIR"
fi

mkdir -p "$TARGET_DIR"

# Link each entry, backing up anything that's already there and isn't ours
BACKED_UP=0
for name in "${ENTRIES[@]}"; do
    src="$INSTALL_DIR/$name"
    dest="$TARGET_DIR/$name"

    if [ -L "$dest" ] && [ "$(readlink "$dest")" = "$src" ]; then
        continue
    fi

    if [ -e "$dest" ] || [ -L "$dest" ]; then
        mkdir -p "$BACKUP_DIR"
        mv "$dest" "$BACKUP_DIR/$name"
        BACKED_UP=1
    fi

    ln -s "$src" "$dest"
done

echo ""
echo "  Installed successfully!"
if [ "$BACKED_UP" = "1" ]; then
    echo ""
    echo "  Note: some existing ~/.claude entries were moved to:"
    echo "    $BACKUP_DIR"
    echo "  To restore one: mv \"$BACKUP_DIR/<name>\" \"$TARGET_DIR/<name>\""
fi
echo ""
echo "  You now have access to:"
echo "    - $(ls -1 "$INSTALL_DIR/commands" 2>/dev/null | grep -c '\.md$') slash commands"
echo "    - $(ls -1 "$INSTALL_DIR/agents" 2>/dev/null | grep -c '\.md$') specialist agents"
echo "    - $(ls -1 "$INSTALL_DIR/skills" 2>/dev/null | wc -l | tr -d ' ') skills"
echo ""
echo "  Restart Claude Code, then test it: type /learn"
echo ""
echo "  To customise:"
echo "    - Edit ~/.preclaude/CLAUDE.md for your preferences"
echo "    - Edit ~/.preclaude/settings.local.json for permissions"
echo ""
echo "  Prefer plugins? Preclaude also installs as a Claude Code plugin:"
echo "    /plugin marketplace add weareprecode/preclaude"
echo "    /plugin install preclaude@preclaude"
echo ""
echo "  To update: run /update in Claude Code, or re-run this installer"
echo ""
