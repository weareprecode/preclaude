#!/bin/bash

# Preclaude Installer
# Symlinks this repo to ~/.claude for cross-project availability

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$HOME/.claude"

echo "🤖 Preclaude Installer"
echo "======================"
echo ""
echo "Source: $SCRIPT_DIR"
echo "Target: $TARGET_DIR"
echo ""

# Check if already installed correctly (commands symlink points to this repo)
if [ -L "$TARGET_DIR/commands" ]; then
    CURRENT_LINK=$(readlink "$TARGET_DIR/commands")
    if [ "$CURRENT_LINK" = "$SCRIPT_DIR/commands" ]; then
        echo "✅ Already installed correctly"
        exit 0
    fi
fi

# Check if ~/.claude already exists and needs handling
if [ -e "$TARGET_DIR" ]; then
    if [ -L "$TARGET_DIR" ]; then
        # It's a directory symlink (old style) - remove it
        echo "⚠️  ~/.claude is a directory symlink (old style)"
        echo "   Converting to new format (real dir with symlinked contents)..."
        rm "$TARGET_DIR"
    elif [ -d "$TARGET_DIR" ]; then
        echo "⚠️  ~/.claude exists as regular directory"
        echo ""
        echo "Options:"
        echo "  1. Backup existing and replace"
        echo "  2. Merge (copy existing files here, then link)"
        echo "  3. Abort"
        read -p "Choice (1/2/3): " -n 1 -r
        echo
        case $REPLY in
            1)
                BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"
                echo "Backing up to: $BACKUP_DIR"
                mv "$TARGET_DIR" "$BACKUP_DIR"
                ;;
            2)
                echo "Merging existing files..."
                # Copy non-conflicting files from existing to repo
                for item in "$TARGET_DIR"/*; do
                    name=$(basename "$item")
                    # Skip items we'll be symlinking
                    if [[ "$name" != "commands" && "$name" != "skills" && "$name" != "agents" && \
                          "$name" != "CLAUDE.md" && "$name" != "settings.json" && "$name" != "settings.local.json" ]]; then
                        cp -rn "$item" "$SCRIPT_DIR/" 2>/dev/null || true
                    fi
                done
                BACKUP_DIR="$HOME/.claude-backup-$(date +%Y%m%d-%H%M%S)"
                mv "$TARGET_DIR" "$BACKUP_DIR"
                echo "Original backed up to: $BACKUP_DIR"
                ;;
            *)
                echo "Aborted"
                exit 1
                ;;
        esac
    fi
fi

# Create real directory with symlinked contents
# (Claude Code doesn't follow directory symlinks, only file/folder symlinks inside)
mkdir -p "$TARGET_DIR"

# Symlink config contents
ln -sf "$SCRIPT_DIR/commands" "$TARGET_DIR/commands"
ln -sf "$SCRIPT_DIR/skills" "$TARGET_DIR/skills"
ln -sf "$SCRIPT_DIR/agents" "$TARGET_DIR/agents"
ln -sf "$SCRIPT_DIR/CLAUDE.md" "$TARGET_DIR/CLAUDE.md"
ln -sf "$SCRIPT_DIR/settings.json" "$TARGET_DIR/settings.json"
ln -sf "$SCRIPT_DIR/settings.local.json" "$TARGET_DIR/settings.local.json"

echo ""
echo "✅ Installed successfully!"
echo ""
echo "Your Claude Code sessions now have access to:"
echo "  • $(ls -1 "$SCRIPT_DIR/commands" 2>/dev/null | wc -l | tr -d ' ') commands"
echo "  • $(ls -1 "$SCRIPT_DIR/skills" 2>/dev/null | wc -l | tr -d ' ') skills"
echo "  • $(ls -1 "$SCRIPT_DIR/agents" 2>/dev/null | wc -l | tr -d ' ') agents"
echo ""
echo "Test it: Open Claude Code and type /learn"
