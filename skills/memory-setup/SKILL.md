---
name: memory-setup
description: Use when the user wants Claude to remember decisions and context across chat sessions in a project, asks for a shared or team memory folder, wants a collaborator's Claude to have the same context after a git pull, or runs /memory-setup. Works on an empty folder or an existing codebase.
---

# Memory setup

Installs a git-committed memory system: `memory/NOW.md` (living snapshot),
`memory/INDEX.md` (append-only index), one detailed record per decision,
a `/remember` skill, a Stop hook that blocks finishing a turn when source
changed without a record, and a CI backstop. Everything is committed, so a
collaborator gets it on pull.

Hierarchy: **CLAUDE.md > docs/ > memory/**. `docs/` is curated truth,
`memory/` is the dated record. Records are rules, not diary. Never secrets.

## Steps

1. **Ground.** Not a git repo → `git init` and commit what exists (or an
   empty README). No `origin/main`? Fine; the hook falls back to `main`,
   then `HEAD`.
2. **Install.** Run `bash ~/.claude/skills/memory-setup/install.sh` from
   the project root. It is idempotent and never overwrites existing files;
   read its output. If it created `CLAUDE.md`, fill the "What this is"
   section (ask one question if it cannot be inferred).
3. **Pipe-test the hook** and show the user the output:
   - `echo '{}' | CLAUDE_PROJECT_DIR="$PWD" .claude/hooks/memory-check.sh`
     straight after install (`memory/` is among the changes) → prints nothing.
   - Create a throwaway source file, move `memory/` aside (`mv memory
     ../memory.bak` or into the scratchpad), run again → prints the block
     JSON. Restore both. Do not use `git stash` for this;
     it fights renames.
4. **Seed `memory/NOW.md`** (replace the template headings' emptiness; keep
   the headings). Sources: README, git log, any handover/decision/TODO docs,
   and `~/.claude/projects/<this project>/memory/*.md` — fold those local
   notes into records so a collaborator's agent gets them. Empty project:
   write purpose, people, first milestone; mark unknowns as unknown.
5. **Write the first record** (`templates/record-template.md`), `kind:
   decision`, about this memory system itself. Options considered must list:
   docs-only; Claude's local auto-memory (per machine, never reaches a
   collaborator); a wiki or Notion (not versioned with the code);
   auto-dumping transcripts on every stop (noise that erodes trust in
   deliberate records); a single appended MEMORY.md (merge conflicts, loads
   the whole archive every session). Append its INDEX line.
6. **Migrate** any dated handover notes into `memory/` as records with
   frontmatter, using `git mv`.
7. **Report.** List exactly what was created or changed. Do not commit. Do
   not `git add -A`. Tell the user: the hook is not live in this session
   until they restart Claude Code or open `/hooks` once, and a collaborator
   needs one restart after pulling.

## Quick reference

| File | Role |
|---|---|
| `memory/NOW.md` | Snapshot; overwritten at every session end |
| `memory/INDEX.md` | One line per record; `merge=union` |
| `memory/YYYY-MM-DD-<author>-<slug>.md` | Context · Options considered · Decision · Consequences · Still owed · Evidence |
| `.claude/skills/remember/SKILL.md` | `/remember` — interviews the session, writes record, updates INDEX and NOW |
| `.claude/hooks/memory-check.sh` | Stop hook; source = anything outside `memory/ docs/ .claude/ .github/` and top-level `.md` |
| `.github/workflows/memory.yml` | PR fails without a record unless body has `no-memory: <reason>` |

## Common mistakes

- Skipping step 5's rejected options. That section is what stops the next
  session re-proposing them.
- Seeding NOW.md from the template's blank headings and calling it done.
  Empty sections are worse than "unknown".
- Testing the hook with `git stash` on a tree that contains a `git mv`.
- Putting env values, tokens or webhook secrets in a record.
