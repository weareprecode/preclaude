# Claude Code Configuration

Personal Claude Code configuration for cross-machine, cross-project consistency.

## Quick Install

```bash
git clone git@github.com:YOUR_USERNAME/claude-config.git ~/claude-config
cd ~/claude-config
./install.sh
```

## Documentation

| Document | Description |
|----------|-------------|
| [SETUP-GUIDE.md](docs/SETUP-GUIDE.md) | Full installation and setup instructions |
| [COMMANDS.md](docs/COMMANDS.md) | Detailed reference for all slash commands |
| [AGENTS.md](docs/AGENTS.md) | Guide to specialised agent personas |
| [RALPH-WALKTHROUGH.md](docs/RALPH-WALKTHROUGH.md) | Step-by-step autonomous build guide |

## What's Included

### Commands (`/command`)
| Command | Description |
|---------|-------------|
| `/learn` | Analyze session, propose CLAUDE.md updates with scoring |
| `/commit` | Conventional commit from staged changes |
| `/kickoff` | Initialize new project with full structure |
| `/prd` | Generate comprehensive technical PRD |
| `/ralph` | Convert PRD to prd.json for autonomous execution |
| `/full-build` | **Complete workflow**: PRD → Ralph → Setup → Execute |
| `/implement` | Execute feature from PRD through to completion |
| `/review` | Comprehensive code review |
| `/marketing` | Generate marketing content from feature/release |
| `/project-complete` | Generate full documentation suite (journal, features, marketing) |
| `/handoff` | Create session handoff notes |
| `/deploy-check` | Pre-deployment verification checklist |

### Skills (Auto-invoked)
| Skill | Triggers On |
|-------|-------------|
| `claude-md-learner` | Session analysis, CLAUDE.md maintenance |
| `prd` | PRD creation, requirements documentation |
| `ralph` | PRD to JSON conversion, autonomous execution setup |
| `prd-to-json` | Legacy: Requirements extraction |
| `marketing-content` | Content generation, social media, blogs |
| `project-kickoff` | New project initialization |
| `project-complete` | End-of-project documentation |
| `dev-browser` | Browser automation, visual verification |

### Agents (`@agent-name`)
| Agent | Use For |
|-------|---------|
| `frontend-developer` | React, Next.js, React Native, UI components |
| `backend-developer` | APIs, Node, Python, databases |
| `database-architect` | Schema design, queries, migrations |
| `devops-engineer` | CI/CD, Docker, Terraform, deployment |
| `security-auditor` | Vulnerability review, OWASP compliance |
| `test-engineer` | Unit, integration, E2E tests |
| `code-reviewer` | PR reviews, quality checks |
| `technical-writer` | Docs, READMEs, API documentation |
| `ui-designer` | Design systems, accessibility, responsive |
| `product-analyst` | PRDs, user stories, requirements |

## Structure

```
~/claude-config/
├── install.sh              # Symlinks to ~/.claude
├── CLAUDE.md               # Global preferences
├── commands/               # Slash commands
│   ├── learn.md
│   ├── commit.md
│   ├── kickoff.md
│   ├── implement.md
│   ├── review.md
│   ├── marketing.md
│   ├── handoff.md
│   └── deploy-check.md
├── skills/                 # Auto-invoked capabilities
│   ├── claude-md-learner/
│   ├── prd-to-json/
│   ├── marketing-content/
│   └── project-kickoff/
└── agents/                 # Specialized personas
    ├── frontend-developer.md
    ├── backend-developer.md
    └── ...
```

## Usage

### Commands
```bash
# In any Claude Code session
/learn              # Analyze session for CLAUDE.md updates
/commit             # Generate conventional commit
/kickoff myproject  # Initialize new project
```

### Agents
```bash
# Invoke specific expertise
@frontend-developer Build a responsive navbar with mobile menu
@security-auditor Review the auth implementation for vulnerabilities
@test-engineer Write integration tests for the user API
```

### Skills
Skills activate automatically based on your request:
- "Convert this PRD to JSON" → triggers prd-to-json
- "Generate social media posts for this feature" → triggers marketing-content

## Customization

### Add Project-Specific Overrides
Create `.claude/CLAUDE.md` in any project to add local context that extends (not replaces) the global config.

### Add New Commands
```bash
# Create new command file
touch ~/claude-config/commands/my-command.md
```

### Modify Global Preferences
Edit `~/claude-config/CLAUDE.md` for preferences that apply everywhere.

## Sync Across Machines

This repo IS your sync mechanism. On a new machine:
```bash
git clone git@github.com:YOUR_USERNAME/claude-config.git ~/claude-config
cd ~/claude-config
./install.sh
```

## For Claude.ai (Web)

The web interface doesn't support this structure directly. Options:

1. **Projects**: Create a "Dev Standards" project, upload skill files as knowledge
2. **Memory**: Key principles are remembered across conversations
3. **Paste**: Copy relevant skill content into conversations as needed
