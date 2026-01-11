#!/bin/bash

# Claude Config Installer
# Symlinks this repo to ~/.claude for cross-project availability

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$HOME/.claude"

echo "🤖 Claude Config Installer"
echo "=========================="
echo ""
echo "Source: $SCRIPT_DIR"
echo "Target: $TARGET_DIR"
echo ""

# Check if ~/.claude already exists
if [ -e "$TARGET_DIR" ]; then
    if [ -L "$TARGET_DIR" ]; then
        CURRENT_LINK=$(readlink "$TARGET_DIR")
        if [ "$CURRENT_LINK" = "$SCRIPT_DIR" ]; then
            echo "✅ Already installed correctly"
            exit 0
        else
            echo "⚠️  ~/.claude exists as symlink to: $CURRENT_LINK"
            read -p "Replace with this config? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rm "$TARGET_DIR"
            else
                echo "Aborted"
                exit 1
            fi
        fi
    else
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
                cp -rn "$TARGET_DIR"/* "$SCRIPT_DIR"/ 2>/dev/null || true
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

# Create symlink
ln -s "$SCRIPT_DIR" "$TARGET_DIR"

echo ""
echo "✅ Installed successfully!"
echo ""
echo "Your Claude Code sessions now have access to:"
echo "  • $(ls -1 "$SCRIPT_DIR/commands" 2>/dev/null | wc -l | tr -d ' ') commands"
echo "  • $(ls -1 "$SCRIPT_DIR/skills" 2>/dev/null | wc -l | tr -d ' ') skills"
echo "  • $(ls -1 "$SCRIPT_DIR/agents" 2>/dev/null | wc -l | tr -d ' ') agents"
echo ""
echo "Test it: Open Claude Code and type /learn"
