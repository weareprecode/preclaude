#!/bin/bash
#
# Preclaude Remote Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/mattthornhill/preclaude/main/install-remote.sh | bash
#

set -e

REPO_URL="https://github.com/mattthornhill/preclaude.git"
INSTALL_DIR="$HOME/.preclaude"
TARGET_DIR="$HOME/.claude"

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
    cd "$INSTALL_DIR"
    git pull --quiet
else
    echo "Cloning preclaude..."
    git clone --quiet "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# Handle existing ~/.claude directory
if [ -e "$TARGET_DIR" ]; then
    if [ -L "$TARGET_DIR" ]; then
        # It's a symlink - remove it
        rm "$TARGET_DIR"
    elif [ -d "$TARGET_DIR" ]; then
        # It's a real directory - back it up
        BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"
        echo "Backing up existing ~/.claude to $BACKUP_DIR"
        mv "$TARGET_DIR" "$BACKUP_DIR"
    fi
fi

# Create ~/.claude with symlinked contents
mkdir -p "$TARGET_DIR"

# Symlink all the config pieces
ln -sf "$INSTALL_DIR/commands" "$TARGET_DIR/commands"
ln -sf "$INSTALL_DIR/skills" "$TARGET_DIR/skills"
ln -sf "$INSTALL_DIR/agents" "$TARGET_DIR/agents"
ln -sf "$INSTALL_DIR/CLAUDE.md" "$TARGET_DIR/CLAUDE.md"
ln -sf "$INSTALL_DIR/settings.json" "$TARGET_DIR/settings.json"
ln -sf "$INSTALL_DIR/settings.local.json" "$TARGET_DIR/settings.local.json"

echo ""
echo "  Installed successfully!"
echo ""
echo "  You now have access to:"
echo "    - $(ls -1 "$INSTALL_DIR/commands" 2>/dev/null | grep -c '\.md$') slash commands"
echo "    - $(ls -1 "$INSTALL_DIR/agents" 2>/dev/null | grep -c '\.md$') specialist agents"
echo "    - $(ls -1 "$INSTALL_DIR/skills" 2>/dev/null | wc -l | tr -d ' ') skills"
echo ""
echo "  Test it: Open Claude Code and type /learn"
echo ""
echo "  To customise:"
echo "    - Edit ~/.preclaude/CLAUDE.md for your preferences"
echo "    - Edit ~/.preclaude/settings.local.json for permissions"
echo ""
echo "  To update: curl -fsSL https://raw.githubusercontent.com/mattthornhill/preclaude/main/install-remote.sh | bash"
echo ""
