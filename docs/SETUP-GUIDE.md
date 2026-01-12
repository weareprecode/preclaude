# Claude Code Config - Setup Guide

This guide explains how to set up your Claude Code configuration on GitHub and use it across all your machines and projects.

---

## Part 1: Initial GitHub Setup

### Step 1: Unzip and Prepare

```bash
# Unzip the config
unzip claude-config.zip

# Move to your preferred location
mv claude-config ~/claude-config

# Navigate to it
cd ~/claude-config
```

### Step 2: Create GitHub Repository

**Option A: Using GitHub CLI (recommended)**
```bash
cd ~/claude-config

# Initialize git
git init

# Create private repo and push
gh repo create claude-config --private --source=. --push
```

**Option B: Manual GitHub Setup**
1. Go to https://github.com/new
2. Create a new **private** repository named `claude-config`
3. Don't initialize with README (we have one)
4. Then run:

```bash
cd ~/claude-config
git init
git add .
git commit -m "Initial Claude Code configuration"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/claude-config.git
git push -u origin main
```

### Step 3: Install on Current Machine

```bash
cd ~/claude-config
chmod +x install.sh
./install.sh
```

This creates a symlink: `~/.claude` → `~/claude-config`

### Step 4: Verify Installation

```bash
# Check symlink
ls -la ~/.claude

# Should show:
# .claude -> /Users/you/claude-config

# Verify files accessible
ls ~/.claude/commands/
ls ~/.claude/skills/
ls ~/.claude/agents/
```

---

## Part 2: Using on New Machines

### Quick Install (New Machine)

```bash
# Clone your config
git clone git@github.com:YOUR_USERNAME/claude-config.git ~/claude-config

# Install
cd ~/claude-config
chmod +x install.sh
./install.sh

# Done! Claude Code now has access to all your commands/skills/agents
```

### Windows (WSL)

```bash
# In WSL terminal
git clone git@github.com:YOUR_USERNAME/claude-config.git ~/claude-config
cd ~/claude-config
./install.sh
```

### Keeping in Sync

When you update the config on one machine:

```bash
# On the machine where you made changes
cd ~/claude-config
git add .
git commit -m "Add new skill for X"
git push

# On other machines
cd ~/claude-config
git pull
```

---

## Part 3: Using in Projects

### Global vs Project-Specific

Your `~/.claude/` config applies to **all projects** automatically. For project-specific customizations, create a local `.claude/` directory.

```
~/.claude/                    # Global (your repo)
├── CLAUDE.md                 # Global preferences
├── commands/                 # Available everywhere
├── skills/                   # Available everywhere
└── agents/                   # Available everywhere

your-project/
├── .claude/                  # Project-specific (optional)
│   └── commands/             # Only for this project
├── CLAUDE.md                 # Project context
└── ...
```

### Starting a New Project

**Option 1: Use /kickoff command**
```bash
# In Claude Code
/kickoff my-new-project
```
This scaffolds a full project with CLAUDE.md, directory structure, etc.

**Option 2: Full workflow with autonomous execution**
```bash
# In Claude Code
/full-build "A SaaS app that helps freelancers track invoices and get paid faster"
```
This runs the complete PRD → Ralph → Build workflow.

**Option 3: Manual setup**
```bash
# Create project
npx shadcn@latest create --preset "YOUR_PRESET_URL" --template next my-project
cd my-project

# Add project-specific CLAUDE.md
cat > CLAUDE.md << 'EOF'
# My Project

## Overview
[Description]

## Stack
- Frontend: Next.js 15, shadcn/ui (Lyra)
- Database: Supabase
- Auth: Better Auth

## Commands
npm run dev
npm run build
npm run test

## Gotchas
[Add as discovered]
EOF
```

---

## Part 4: Workflow Examples

### Example 1: Starting Fresh Project

```bash
# 1. Open Claude Code in empty directory
claude

# 2. Create full project with PRD
/full-build "Mobile CRM for UK tradespeople - simple job tracking, invoicing, and customer management"

# 3. Claude will ask for your shadcn preset URL
# Paste your URL or press Enter for default

# 4. Review generated PRD
# Make any edits needed

# 5. Start autonomous build
./scripts/ralph/ralph.sh 25

# 6. After completion, generate marketing docs
/project-complete
```

### Example 2: Adding Feature to Existing Project

```bash
# 1. Open Claude Code in project directory
cd my-project
claude

# 2. Create PRD for the feature
/prd "Add Stripe subscription billing with free trial"

# 3. Convert to prd.json format
/prd-json docs/prd/stripe-billing-prd.md

# 4. Run autonomous implementation
/build 15

# 5. Review and test
/review
```

### Example 3: Quick Implementation (No Ralph)

```bash
# For smaller features that don't need full autonomy
/implement "Add dark mode toggle to settings page"
```

### Example 4: End of Session

```bash
# Create handoff notes for continuity
/handoff

# Check for CLAUDE.md learnings
/learn
```

### Example 5: Pre-Deploy Check

```bash
/deploy-check
```

---

## Part 5: Customizing Your Config

### Adding New Commands

```bash
# Create new command file
touch ~/claude-config/commands/my-command.md

# Edit with your instructions
cat > ~/claude-config/commands/my-command.md << 'EOF'
---
description: What this command does
allowed-tools: Read, Write, Bash
model: sonnet
---

# My Command

Instructions for Claude...
EOF

# Commit and push
cd ~/claude-config
git add .
git commit -m "Add my-command"
git push
```

### Adding New Skills

```bash
# Create skill directory
mkdir -p ~/claude-config/skills/my-skill

# Create SKILL.md
cat > ~/claude-config/skills/my-skill/SKILL.md << 'EOF'
# My Skill

## Purpose
What this skill does

## When to Invoke
- Trigger phrases
- Situations

## Instructions
How to use this skill...
EOF

# Commit and push
cd ~/claude-config
git add .
git commit -m "Add my-skill"
git push
```

### Modifying Global Preferences

Edit `~/claude-config/CLAUDE.md` for preferences that apply everywhere:
- Code style preferences
- Communication style
- Default stack choices
- Agency conventions

---

## Part 6: Claude.ai (Web) Setup

The web interface doesn't have the same file system, but you can use **Projects**:

### Create a Dev Standards Project

1. Go to claude.ai → Projects
2. Create new project: "Development Standards"
3. Upload these files as project knowledge:
   - `CLAUDE.md`
   - `skills/prd/SKILL.md`
   - `skills/ralph/SKILL.md`
   - `skills/marketing-content/SKILL.md`
   - `skills/project-complete/SKILL.md`

4. Any chat within this project will have access to your standards

### Using Memory

For key preferences, ask Claude to remember:
```
Remember: When I ask for a PRD, use the Gherkin format with 20+ user stories. 
When setting up shadcn, ask me for my preset URL first.
```

---

## Part 7: Directory Structure Reference

```
~/claude-config/
├── install.sh              # Symlinks to ~/.claude
├── README.md               # Documentation
├── CLAUDE.md               # Global preferences
│
├── commands/               # Slash commands (/command)
│   ├── learn.md            # Session analysis
│   ├── commit.md           # Conventional commits
│   ├── kickoff.md          # Project scaffolding
│   ├── prd.md              # Generate PRD
│   ├── ralph.md            # Convert to Ralph format
│   ├── full-build.md       # Complete workflow
│   ├── implement.md        # Feature implementation
│   ├── review.md           # Code review
│   ├── marketing.md        # Marketing content
│   ├── project-complete.md # End-of-project docs
│   ├── handoff.md          # Session continuity
│   └── deploy-check.md     # Pre-deploy checks
│
├── skills/                 # Auto-invoked capabilities
│   ├── prd/                # PRD generation
│   ├── ralph/              # PRD to JSON conversion
│   ├── dev-browser/        # Browser automation
│   ├── claude-md-learner/  # CLAUDE.md maintenance
│   ├── marketing-content/  # Content generation
│   ├── project-kickoff/    # Project setup
│   ├── project-complete/   # End-of-project docs
│   └── prd-to-json/        # Legacy JSON conversion
│
└── agents/                 # Specialized personas (@agent)
    ├── frontend-developer.md
    ├── backend-developer.md
    ├── database-architect.md
    ├── devops-engineer.md
    ├── security-auditor.md
    ├── test-engineer.md
    ├── code-reviewer.md
    ├── technical-writer.md
    ├── ui-designer.md
    └── product-analyst.md
```

---

## Part 8: Troubleshooting

### Commands not appearing

```bash
# Check symlink exists
ls -la ~/.claude

# If broken, reinstall
cd ~/claude-config
./install.sh
```

### Git sync issues

```bash
# Force pull (discard local changes)
cd ~/claude-config
git fetch origin
git reset --hard origin/main

# Or merge conflicts manually
git pull
# Resolve conflicts
git add .
git commit -m "Resolve merge conflicts"
```

### Claude Code not seeing skills

Skills are loaded based on context. Ensure:
1. Skill file is named `SKILL.md` (case-sensitive)
2. Skill is in `~/.claude/skills/[skill-name]/SKILL.md`
3. Restart Claude Code after adding new skills

### Permission issues

```bash
chmod +x ~/claude-config/install.sh
chmod -R 755 ~/claude-config/
```

---

## Quick Reference Card

```bash
# Setup (one-time)
git clone git@github.com:USER/claude-config.git ~/claude-config
cd ~/claude-config && ./install.sh

# New project
/kickoff project-name
# or
/full-build "product description"

# Feature development
/prd "feature description"
/prd-json docs/prd/feature-prd.md
/build 25

# Session management
/handoff                    # End of session notes
/learn                      # CLAUDE.md updates

# Quality
/review                     # Code review
/deploy-check               # Pre-deploy

# Documentation
/marketing feature-name     # Marketing content
/project-complete           # Full doc suite

# Agents
@frontend-developer         # UI work
@backend-developer          # API work
@security-auditor           # Security review

# Keep config in sync
cd ~/claude-config && git pull
cd ~/claude-config && git add . && git commit -m "msg" && git push
```
