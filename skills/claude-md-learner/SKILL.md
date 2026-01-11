# CLAUDE.md Learning Analyzer

## Purpose
Analyze coding sessions and maintain CLAUDE.md as a lean, high-signal document. This skill adds genuinely valuable learnings, flags outdated content for removal, and enforces a strict size budget.

## Core Principles

1. **CLAUDE.md is not a wiki** — It's a boot-up context file. Every line costs tokens.
2. **Learnings must pay rent** — If it won't change Claude's behavior, it doesn't belong.
3. **Prefer removal over addition** — A shorter, accurate file beats a longer, comprehensive one.
4. **One concept per line** — Atomic learnings only. No compound statements.

---

## When to Invoke

- End of coding session (via `/learn` command)
- After solving a problem that took multiple attempts
- When you catch yourself explaining the same thing twice
- After a "wish I'd known that earlier" moment

---

## Step 1: Audit Current CLAUDE.md

Before proposing additions, analyze the existing file:

```
CURRENT STATE AUDIT
===================
Total lines: [N] / 300 max
Sections: [List sections]
Last modified: [Date if known]

HEALTH CHECK:
[ ] Under 300 lines?
[ ] No redundant entries?
[ ] All entries still accurate?
[ ] No obvious gaps for this project type?
```

Flag any lines that appear:
- **Stale**: References removed dependencies, old patterns, or deprecated approaches
- **Redundant**: Duplicates information elsewhere (README, config files, other docs)
- **Vague**: Too generic to be actionable ("write clean code", "follow best practices")
- **Obvious**: Inferable from codebase structure or standard framework behavior

---

## Step 2: Gather Session Evidence

Collect concrete data about what happened:

### Commands Run
What commands were executed? Which failed? Which required flags or specific sequences?

### Files Changed
What was created, modified, or deleted? Any unexpected dependencies between files?

### Errors Encountered
What broke? What was the fix? Was it obvious or did it require investigation?

### Patterns Discovered
Did a pattern emerge that wasn't documented? Did you deviate from documented patterns?

### Time Sinks
What took longer than expected? Why? Could context have helped?

---

## Step 3: Score Candidate Learnings

For each potential learning, score against these criteria (0-2 points each):

| Criterion | 0 Points | 1 Point | 2 Points |
|-----------|----------|---------|----------|
| **Novelty** | Already documented | Partially covered | Completely new |
| **Frequency** | One-time issue | Occasional | Every session |
| **Impact** | Minor friction | Delays work | Blocks progress |
| **Specificity** | Vague guidance | Somewhat specific | Exact command/path/value |
| **Durability** | Likely to change soon | Stable for months | Permanent |

**Scoring thresholds:**
- **8-10 points**: Strong add — include immediately
- **5-7 points**: Conditional — add only if CLAUDE.md under 250 lines
- **0-4 points**: Reject — not worth the token cost

---

## Step 4: Classify Learning Scope

Determine where the learning belongs:

### Project CLAUDE.md (`.claude/CLAUDE.md` or root `CLAUDE.md`)
- Project-specific configurations
- This codebase's quirks and patterns
- Client preferences
- Integration details for this project's services

### Global CLAUDE.md (`~/.claude/CLAUDE.md`)
- Patterns that apply across ALL your projects
- Personal workflow preferences
- Tool configurations that travel with you
- Agency-wide conventions (naming, structure, etc.)

### Neither (Don't Add)
- Belongs in README.md (setup instructions for humans)
- Belongs in code comments (implementation details)
- Belongs in config files (settings that tools read)
- Belongs in task files (session-specific context)

---

## Step 5: Format for Minimal Token Cost

Every word costs tokens. Optimize ruthlessly.

### ❌ Bad (Verbose)
```markdown
## Database Commands
When you need to reset the database during development, you should run the db:reset command which will drop all tables and re-run migrations. Make sure Docker is running first or you'll get a connection error.
```

### ✅ Good (Minimal)
```markdown
## Commands
- `npm run db:reset` — requires Docker running
```

### Formatting Rules

1. **No explanatory prose** — CLAUDE.md is for Claude, not humans
2. **Use fragments, not sentences** — "requires Docker" not "This requires Docker to be running"
3. **Inline conditions** — "X — only when Y" not separate bullets
4. **Skip obvious context** — "npm run" not "run the npm command"
5. **Max 12 words per entry** — Force yourself to distill

---

## Step 6: Propose Changes as Diff

Present additions AND removals:

```
CLAUDE.MD MAINTENANCE PROPOSAL
==============================

📊 Current: 187 lines | After changes: 184 lines

REMOVALS (Stale/Redundant):
---------------------------
Section: Commands
- `npm run legacy:build` — Legacy system removed in v2.0
  Reason: Dead code, build script no longer exists

Section: Gotchas  
- "React 17 requires special JSX transform" — Upgraded to React 18
  Reason: No longer applicable

ADDITIONS:
----------
Section: Gotchas
+ `prisma generate` required after schema changes — silent type errors otherwise
  Score: 9/10 | Scope: Project
  Evidence: Cost 20 mins debugging type mismatch today

Section: Commands
+ `npm run test:db` — spins up test container, tears down after
  Score: 8/10 | Scope: Project
  Evidence: Ran this 6 times today, not documented

NO CHANGE (Evaluated but rejected):
-----------------------------------
- "Use pnpm instead of npm" — Score: 3/10
  Reason: Already in package.json engines field

NET RESULT: -3 lines (removed 2, added 2, net reduction from consolidation)

Apply these changes? [Waiting for confirmation]
```

---

## Anti-Pattern Watchlist

Auto-reject regardless of score:

| Pattern | Example | Why Rejected |
|---------|---------|--------------|
| Framework basics | "Next.js uses App Router" | Claude knows this |
| Tool documentation | "Run eslint to lint" | That's what eslint does |
| Generic advice | "Write tests", "Handle errors" | Not actionable |
| File locations only | "Components are in /src/components" | Visible in tree |
| Temporary workarounds | "Using X until Y is fixed" | Will be stale |
| Personal preferences | "I prefer tabs" | Use .editorconfig |
| Explanations | "This is because..." | Wrong format |
| Future plans | "We will eventually..." | Not current state |
| Standard commands | "npm install", "git commit" | Universal knowledge |
| Config file contents | "ESLint rules are..." | Read the config |

---

## Decision Tree

```
New Learning Candidate
        │
        ▼
┌─────────────────────┐
│ Is it already in    │──Yes──▶ REJECT
│ CLAUDE.md?          │
└─────────────────────┘
        │ No
        ▼
┌─────────────────────┐
│ Is it in README,    │──Yes──▶ REJECT (redundant)
│ config, or code?    │
└─────────────────────┘
        │ No
        ▼
┌─────────────────────┐
│ Is it obvious from  │──Yes──▶ REJECT
│ codebase structure? │
└─────────────────────┘
        │ No
        ▼
┌─────────────────────┐
│ Will it apply to    │──No───▶ REJECT (one-time)
│ future sessions?    │
└─────────────────────┘
        │ Yes
        ▼
┌─────────────────────┐
│ Can it be stated    │──No───▶ Distill further
│ in ≤12 words?       │
└─────────────────────┘
        │ Yes
        ▼
┌─────────────────────┐
│ Score ≥ 8?          │──Yes──▶ ADD
└─────────────────────┘
        │ No
        ▼
┌─────────────────────┐
│ Score 5-7 AND       │──Yes──▶ ADD
│ CLAUDE.md < 250 ln? │
└─────────────────────┘
        │ No
        ▼
      REJECT
```

---

## Output Template

```
CLAUDE.MD LEARNING ANALYSIS
===========================

📊 Status: [N]/300 lines ([healthy/warning/critical])

Session: [One-line description]
Evidence: [N] files changed, [N] errors resolved

Candidates: [N] evaluated
├── Added (8+):      [N]
├── Conditional:     [N] ([added/skipped] — [reason])
├── Rejected (0-4):  [N]
└── Auto-rejected:   [N]

REMOVALS:
---------
- [Section]: "[text]" — [reason stale/redundant]

ADDITIONS:
----------
+ [Section]: [new entry]
  Score: [N]/10 | Evidence: [what happened]

REJECTED:
---------
- "[candidate]" — [N]/10: [reason]

────────────────────────────
Net: [+N/-N] lines → [new total]/300
Apply changes? (y/n)
```
