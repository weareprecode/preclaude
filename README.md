# Preclaude

Supercharge Claude Code with slash commands, specialist agents, and autonomous workflows.

## One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash
```

## What You Get

### 13 Slash Commands

| Command | Description |
|---------|-------------|
| `/commit` | Generate conventional commit from staged changes |
| `/review` | Comprehensive code review of recent changes |
| `/learn` | Analyse session and propose CLAUDE.md updates |
| `/kickoff` | Initialise new project with full structure |
| `/prd` | Generate comprehensive technical PRD |
| `/ralph` | Convert PRD to autonomous execution format |
| `/build` | Run Ralph autonomous loop on existing prd.json |
| `/full-build` | Complete workflow: PRD -> Ralph -> Build |
| `/implement` | Execute feature from discovery to completion |
| `/marketing` | Generate multi-platform marketing content |
| `/project-complete` | Generate end-of-project documentation suite |
| `/handoff` | Create session handoff notes |
| `/deploy-check` | Pre-deployment verification checklist |

### 14 Specialist Agents

| Agent | Use For |
|-------|---------|
| `@frontend-developer` | React, Next.js, UI components, styling |
| `@backend-developer` | APIs, Node, Python, databases |
| `@database-architect` | Schema design, queries, migrations |
| `@devops-engineer` | CI/CD, Docker, Terraform, deployment |
| `@security-auditor` | Vulnerability review, OWASP compliance |
| `@test-engineer` | Unit, integration, E2E tests |
| `@code-reviewer` | PR reviews, quality checks |
| `@technical-writer` | Docs, READMEs, API documentation |
| `@ui-designer` | Design systems, component libraries, styling |
| `@ux-researcher` | User research, flows, wireframes, usability |
| `@product-analyst` | PRDs, user stories, requirements |
| `@expo-developer` | React Native, Expo, cross-platform mobile |
| `@ios-developer` | Swift, SwiftUI, native iOS apps |
| `@android-developer` | Kotlin, Jetpack Compose, native Android |

### Ralph Autonomous Builder

Build entire products autonomously:

```bash
/full-build "Invoice tracker for freelancers"
```

Ralph will:
1. Generate a comprehensive PRD with 20+ user stories
2. Convert to atomic implementation tasks
3. Build each feature iteratively
4. Run quality checks (typecheck, lint, tests)
5. Commit on success, move to next story

## Documentation

| Document | Description |
|----------|-------------|
| [Commands Reference](docs/COMMANDS.md) | Detailed guide for all slash commands |
| [Agents Reference](docs/AGENTS.md) | Guide to specialist agent personas |
| [Ralph Walkthrough](docs/RALPH-WALKTHROUGH.md) | Step-by-step autonomous build guide |

## Customisation

### Your Preferences

Edit `~/.preclaude/CLAUDE.md` to customise:
- Code style preferences
- Communication style
- Default tech stack
- Response format

See [CLAUDE.example.md](CLAUDE.example.md) for a template.

### Permissions

Edit `~/.preclaude/settings.local.json` to control what Claude can do:
- Allow specific Bash commands
- Deny dangerous operations
- Control file access

See [settings.example.json](settings.example.json) for a template.

### Add Your Own Commands

Create new commands in `~/.preclaude/commands/`:

```bash
touch ~/.preclaude/commands/my-command.md
```

## Manual Installation

If you prefer not to use the curl installer:

```bash
git clone https://github.com/weareprecode/preclaude.git ~/.preclaude
cd ~/.preclaude
./install.sh
```

## Updating

Re-run the installer:

```bash
curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash
```

Or update manually:

```bash
cd ~/.preclaude
git pull
```

Your customisations to `CLAUDE.md` and `settings.local.json` are preserved.

### Staying on Current Version

Nothing auto-updates. Simply don't run update commands to keep your current version.

### Forking for Custom Changes

To maintain your own version:

1. Fork the repo on GitHub
2. Update your local remote:
   ```bash
   cd ~/.preclaude
   git remote set-url origin git@github.com:YOUR_USERNAME/preclaude.git
   ```
3. Push your customisations
4. Pull from your fork to update

## How It Works

The installer:
1. Clones this repo to `~/.preclaude`
2. Creates `~/.claude` directory
3. Symlinks commands, agents, skills, and settings

Claude Code automatically picks up files in `~/.claude`, giving you access to all commands and agents in every project.

## Contributing

PRs welcome! See the command and agent files for examples of the format.

## License

CC BY-NC 4.0 — Free to use and modify, but not for commercial purposes.
