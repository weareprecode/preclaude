# Preclaude - Setup Guide

How to install Preclaude, keep it updated, and customise it across your machines and projects.

---

## Part 1: Installing

### Option A: As a Claude Code plugin (recommended)

Inside Claude Code:

```
/plugin marketplace add weareprecode/preclaude
/plugin install preclaude@preclaude
```

The plugin manager handles versions and updates. This installs the commands, agents, and skills; global `CLAUDE.md` preferences and permission settings stay yours to manage (see [CLAUDE.example.md](../CLAUDE.example.md) and [settings.example.json](../settings.example.json) for templates).

### Option B: One-line installer

```bash
curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash
```

This clones the repo to `~/.preclaude` and symlinks the pieces into `~/.claude` — commands, agents, skills, a starter `CLAUDE.md`, and settings. It only touches the entries Preclaude owns; anything already there is backed up per-entry with restore instructions printed.

### Option C: Manual clone

```bash
git clone https://github.com/weareprecode/preclaude.git ~/.preclaude
cd ~/.preclaude
./install.sh
```

**Important**: Restart Claude Code after installation for the new commands and agents to load.

### Verify Installation

```bash
# Symlinked entries point at ~/.preclaude
ls -la ~/.claude

# Verify files accessible
ls ~/.claude/commands/
ls ~/.claude/skills/
ls ~/.claude/agents/
```

Then open Claude Code and type `/learn` — it should be recognised.

---

## Part 2: Using on New Machines

### Quick Install (New Machine)

Plugin route: run the same two `/plugin` commands inside Claude Code.

Installer route:

```bash
curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash
# Restart Claude Code to load new commands and agents
```

### Windows (WSL)

```bash
# In WSL terminal
curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash
```

### Keeping in Sync

Run `/update` in Claude Code (installer route), update via the plugin manager (plugin route), or manually:

```bash
cd ~/.preclaude
git pull
```

If you maintain a fork with your own commands, push changes from one machine and `git pull` on the others — the symlinks pick them up immediately.

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
- Frontend: Next.js (latest stable major), shadcn/ui (Lyra)
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
touch ~/.preclaude/commands/my-command.md

# Edit with your instructions
cat > ~/.preclaude/commands/my-command.md << 'EOF'
---
description: What this command does
allowed-tools: Read, Write, Bash
model: sonnet
---

# My Command

Instructions for Claude...
EOF

# Commit and push
cd ~/.preclaude
git add .
git commit -m "Add my-command"
git push
```

### Adding New Skills

```bash
# Create skill directory
mkdir -p ~/.preclaude/skills/my-skill

# Create SKILL.md (frontmatter is required for auto-discovery)
cat > ~/.preclaude/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: What this skill does. Use when [trigger phrases and situations Claude should match on].
---

# My Skill

## Purpose
What this skill does

## Instructions
How to use this skill...
EOF

# Commit and push
cd ~/.preclaude
git add .
git commit -m "Add my-skill"
git push
```

### Modifying Global Preferences

Edit `~/.preclaude/CLAUDE.md` for preferences that apply everywhere:
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
~/.preclaude/
├── install.sh              # Symlinks to ~/.claude
├── README.md               # Documentation
├── CLAUDE.md               # Global preferences
│
├── commands/               # Slash commands (25 total)
│   ├── commit.md           # Conventional commits
│   ├── pr.md               # Create pull request
│   ├── review.md           # Code review
│   ├── test.md             # Generate tests
│   ├── debug.md            # Analyse errors
│   ├── status.md           # Quick health check
│   ├── learn.md            # Session analysis
│   ├── handoff.md          # Session continuity
│   ├── kickoff.md          # Project scaffolding
│   ├── prd.md              # Generate PRD
│   ├── prd-json.md         # Convert PRD to JSON
│   ├── build.md            # Run Ralph loop
│   ├── full-build.md       # Complete workflow
│   ├── implement.md        # Feature implementation
│   ├── research.md         # Competitive research
│   ├── polish.md           # Polish UI
│   ├── refactor.md         # Refactor code
│   ├── migrate.md          # Run migrations
│   ├── deps.md             # Check dependencies
│   ├── seo.md              # Audit SEO
│   ├── analytics.md        # Setup analytics
│   ├── stakeholder.md      # Stakeholder updates
│   ├── marketing.md        # Marketing content
│   ├── project-complete.md # End-of-project docs
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
└── agents/                 # Specialized personas (15 total)
    ├── frontend-developer.md
    ├── backend-developer.md
    ├── database-architect.md
    ├── devops-engineer.md
    ├── security-auditor.md
    ├── test-engineer.md
    ├── code-reviewer.md
    ├── technical-writer.md
    ├── ui-designer.md
    ├── ux-researcher.md
    ├── product-analyst.md
    ├── performance-engineer.md
    ├── expo-developer.md
    ├── ios-developer.md
    └── android-developer.md
```

---

## Part 8: Troubleshooting

### Commands not appearing

```bash
# Check symlink exists
ls -la ~/.claude

# If broken, reinstall
cd ~/.preclaude
./install.sh
```

### Git sync issues

```bash
# Force pull (discard local changes)
cd ~/.preclaude
git fetch origin
git reset --hard origin/main

# Or merge conflicts manually
git pull
# Resolve conflicts
git add .
git commit -m "Resolve merge conflicts"
```

### Commands or agents not appearing

After installation or updates:
1. **Restart Claude Code** — This is the most common fix
2. Check symlink exists: `ls -la ~/.claude`
3. Verify files are in place: `ls ~/.claude/commands/`

### Claude Code not seeing skills

Skills are loaded based on context. Ensure:
1. Skill file is named `SKILL.md` (case-sensitive)
2. Skill is in `~/.claude/skills/[skill-name]/SKILL.md`
3. **Restart Claude Code** after adding new skills

### Permission issues

```bash
chmod +x ~/.preclaude/install.sh
chmod -R 755 ~/.preclaude/
```

---

## Quick Reference Card

```bash
# Setup (one-time)
curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash
# ⚠️  Restart Claude Code after installation!

# New project
/kickoff project-name
# or
/full-build "product description"

# Feature development
/prd "feature description"
/prd-json docs/prd/feature-prd.md
/build 25

# Git workflow
/commit                     # Conventional commit
/pr                         # Create pull request
/review                     # Code review

# Quality checks
/status                     # Git, lint, types, tests
/test                       # Generate tests
/debug                      # Analyse errors
/deploy-check               # Pre-deploy

# Code improvement
/polish                     # Match design reference
/refactor                   # Clean up code
/migrate                    # Database/framework upgrades
/deps                       # Check dependencies

# Documentation
/seo                        # Audit SEO
/analytics                  # Setup PostHog/GA
/stakeholder                # Progress reports
/marketing feature-name     # Marketing content
/project-complete           # Full doc suite

# Session management
/handoff                    # End of session notes
/learn                      # CLAUDE.md updates

# Agents (15 available)
@frontend-developer         # UI work
@backend-developer          # API work
@database-architect         # Schema design
@security-auditor           # Security review
@test-engineer              # Testing
@performance-engineer       # Core Web Vitals, bundle

# Keep config in sync
cd ~/.preclaude && git pull
cd ~/.preclaude && git add . && git commit -m "msg" && git push
```
