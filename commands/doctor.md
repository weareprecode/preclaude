---
description: Diagnose your Preclaude and Claude Code setup — broken links, conflicts, invalid settings, version drift, and low-quality commands or skills
allowed-tools: Read, Bash, Glob, Grep, WebFetch, AskUserQuestion
argument-hint: [install | skills | all — defaults to all]
---

# Doctor: $ARGUMENTS

Check that Preclaude is actually installed the way it thinks it is, and that the commands, agents and skills on this machine are in a state Claude Code can use well.

**Diagnose first, fix second.** Report everything, then offer to fix what's safely fixable. Never modify `~/.claude` without asking — it holds credentials, history and other tools' plugins.

## Scope

`install` checks the installation. `skills` audits command/agent/skill quality. No argument, or `all`, does both.

---

## Install checks

Preclaude installs one of two ways, and the most common failure is **both at once** — the plugin and the symlink install each providing the same commands, so it's ambiguous which one is live and edits to one appear to do nothing.

Work out which are present:
- Symlink install: entries in `~/.claude/` (`commands`, `skills`, `agents`, `CLAUDE.md`, `settings.json`, `settings.local.json`) symlinked to a clone, usually `~/.preclaude`
- Plugin install: Preclaude present under the Claude Code plugin directory

Then check:

- **Dangling symlinks** — a linked entry whose target no longer exists. Silent and total failure; the commands simply aren't there.
- **Hijacked entries** — an entry that exists but isn't a symlink to the expected source, i.e. a real directory shadowing the install.
- **Both installs live** — report which one wins and offer to remove the other.
- **JSON validity** — `settings.json`, `settings.local.json`, `.mcp.json` and plugin manifests all parse. An invalid settings file can stop Claude Code loading cleanly.
- **`settings.local.json` present** — it's untracked and created from the example at install; a missing one means permissions fall back to defaults.
- **Version drift** — compare the local clone against its remote (`git -C ~/.preclaude status` and a fetch), and the plugin version against the marketplace. Report how far behind, and whether the clone has uncommitted local modifications that an update would conflict with. Never pull automatically.
- **Orphaned backups** — `~/.claude-backup-*` directories left by the installer. Report their size; offer to remove only ones the user confirms.
- **MCP servers** — which are configured, and which need authentication. Say plainly that authenticating needs an interactive session; never ask for tokens or auth codes.
- **Counts** — how many commands, agents and skills are actually resolving, versus what the install claims.

Read-only commands are fine to run without asking. Anything that writes, deletes, pulls or authenticates needs explicit confirmation, one item at a time.

## Skill and command quality

This is the part that matters as models get stronger. A skill isn't ignored because skills don't work — it's ignored because it's written in a way that invites deviation.

Audit every command, agent and skill on the machine (or just this project's, if run inside one — ask if ambiguous):

**Structural** — hard failures:
- Missing or malformed YAML frontmatter
- A skill whose `name` doesn't match its directory, or a `SKILL.md` that isn't named that
- Missing `description` — the field the model uses to decide relevance, so an absent one means the skill effectively doesn't exist
- `allowed-tools` naming tools that don't exist, or omitting a tool the body clearly requires
- Broken references to files, scripts or paths the skill depends on

**Quality** — softer, and worth reporting with a reason rather than a score:
- **Descriptions that don't say when to use the thing.** A description explaining what it *is* but not what triggers it will lose to a better-described neighbour.
- **Over-prescription.** Long verbatim output templates, rigid phase-by-phase scripts, and exact wording the model is told to reproduce. Strong models deviate from these — the more rigid the script, the more it looks like the skill was ignored. Flag the worst offenders and say which parts are worth loosening into intent and guardrails.
- **Length.** Very long files crowd out the actual task. Note anything unusually long and suggest what could move into a reference file.
- **Duplication and collision.** Two commands with near-identical descriptions compete, and the model picks arbitrarily between them.
- **Stale content.** References to model names, tools, flags or paths that no longer exist.

Report the worst handful with specifics, not every nit on every file. A list of 200 findings gets ignored.

## Guardrails

- Never write to `~/.claude` without explicit confirmation for that specific change.
- Never delete a backup directory, run a `git pull`, or remove an install without asking.
- Never touch another tool's plugins, credentials or history.
- Don't report a problem you haven't verified — check the filesystem rather than inferring from what should be there.
- If something can't be checked, say so rather than passing it.

## Finishing

Lead with the verdict: healthy, or the one thing that's actually broken. Then the findings, worst first, each with what to do about it. Offer the fixes as a numbered list they can pick from rather than applying anything unprompted.
