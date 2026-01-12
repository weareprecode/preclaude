# Commands Reference

Complete reference for all available slash commands.

---

## Quick Reference

| Command | Description | Use When |
|---------|-------------|----------|
| `/commit` | Conventional commit | Ready to commit staged changes |
| `/review` | Code review | Before PR or after changes |
| `/learn` | CLAUDE.md updates | End of session |
| `/handoff` | Session notes | Stopping work mid-task |
| `/kickoff` | New project | Starting fresh project |
| `/prd` | Generate PRD | Planning new feature |
| `/prd-json` | PRD to JSON | Preparing for autonomous build |
| `/build` | Run Ralph loop | Have prd.json, ready to build |
| `/full-build` | Complete workflow | New product from scratch |
| `/implement` | Feature build | Smaller features |
| `/marketing` | Marketing content | Launch or feature release |
| `/project-complete` | Full doc suite | Project finished |
| `/deploy-check` | Pre-deploy verification | Before deployment |

---

## `/commit`

**Generate conventional commit message from staged changes.**

### When to Use
- You have changes staged (`git add`)
- Ready to commit

### What It Does
1. Reads staged diff
2. Analyzes changes
3. Generates conventional commit message
4. Asks for confirmation before committing

### Format
```
<type>(<scope>): <description>

[optional body]
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting
- `refactor` - Code restructuring
- `perf` - Performance
- `test` - Tests
- `chore` - Maintenance

### Example
```bash
# Stage your changes
git add src/components/Button.tsx

# Generate commit
/commit
# Output: feat(ui): add primary button variant with hover states
```

---

## `/review`

**Comprehensive code review of recent changes.**

### When to Use
- Before creating a PR
- After completing a feature
- Code quality check

### What It Does
1. Gathers staged and unstaged diffs
2. Evaluates against 7 criteria:
   - Correctness
   - Security
   - Performance
   - Code Quality
   - TypeScript
   - Testing
   - Documentation
3. Outputs structured review

### Output Format
```
CODE REVIEW
===========
Files reviewed: 5

🔴 BLOCKERS (must fix):
[File:Line] SQL injection vulnerability
  Problem: User input not sanitized
  Fix: Use parameterized query

🟡 SUGGESTIONS (should consider):
[File:Line] Consider memoizing this calculation

🟢 GOOD PATTERNS:
- Excellent error boundary implementation

📊 SUMMARY:
Blockers: 1
Suggestions: 3
Overall: REQUEST CHANGES
```

---

## `/learn`

**Analyse session and propose CLAUDE.md updates.**

### When to Use
- End of coding session
- After discovering project-specific gotchas
- When patterns emerge

### What It Does
1. Audits current CLAUDE.md (max 300 lines)
2. Reviews recent commits and file changes
3. Scores potential learnings (0-10):
   - Novelty
   - Frequency
   - Impact
   - Specificity
   - Durability
4. Proposes additions/removals

### Scoring Thresholds
- 8-10: Add
- 5-7: Add only if under 250 lines
- 0-4: Reject

### Auto-Rejects
- Framework basics
- Obvious file locations
- Anything in README
- Temporary workarounds

### Example Output
```
CLAUDE.MD LEARNING ANALYSIS
===========================
📊 Status: 127/300 lines

CANDIDATES EVALUATED:
- "Prisma needs --force after schema changes"
  N|F|I|S|D = 2|2|2|2|2 → 10/10 → ADD

PROPOSAL:
+ Gotchas: prisma db push --force — required after enum changes
```

---

## `/handoff`

**Create session handoff notes for continuity.**

### When to Use
- Stopping work mid-task
- End of day
- Before context switch

### What It Does
1. Captures git status and recent changes
2. Creates structured handoff document
3. Saves to `docs/handoff/[date]-session.md`

### Output Includes
- Session summary
- Completed items
- In-progress work
- Decisions made
- Technical notes
- Next session priorities
- Files to focus on

### Example
```bash
/handoff
# Creates: docs/handoff/2024-01-15-session.md
```

---

## `/kickoff [project-name]`

**Initialise new project with full structure.**

### When to Use
- Starting new project
- Need scaffolding with conventions

### What It Does
1. Gathers requirements (type, framework, database, auth)
2. Creates directory structure
3. Generates CLAUDE.md
4. Initialises git
5. Installs dependencies

### Directory Structure Created
```
project-name/
├── .github/workflows/ci.yml
├── .claude/settings.json
├── docs/prd/
├── docs/design/
├── docs/handoff/
├── src/
├── tests/
├── reference/ROADMAP.md
├── CLAUDE.md
└── README.md
```

---

## `/prd [description]`

**Generate comprehensive technical PRD.**

### When to Use
- Planning new feature or product
- Need detailed requirements before building
- Want structured user stories

### What It Does
1. Gathers product description, audience, constraints
2. Generates 15-section PRD:
   - Product Overview
   - User Stories (20+ in Gherkin format)
   - User Flows
   - Screens/UI
   - Features
   - Architecture
   - System Design
   - API Specifications
   - Data Model
   - Security
   - Performance
   - Scalability
   - Testing
   - Deployment
   - Maintenance
3. Saves to `docs/prd/[name]-prd.md`

### Example
```bash
/prd "Invoice tracking app for freelancers with Stripe integration"
```

---

## `/prd-json [path-to-prd]`

**Convert PRD to prd.json for autonomous build execution.**

### When to Use
- Have a PRD ready
- Want autonomous implementation
- Preparing for `/build` command

### What It Does
1. Analyses PRD for all features
2. Breaks into atomic user stories
3. Sizes each story (must fit one context window)
4. Orders by dependencies
5. Adds acceptance criteria with quality checks
6. Creates `scripts/ralph/prd.json`

### Story Size Rules
- Describable in 2-3 sentences
- Single clear deliverable
- ~30 min focused work

### Output
```bash
/prd-json docs/prd/invoice-tracker-prd.md
# Creates: scripts/ralph/prd.json
```

---

## `/build [iterations] [path-to-prd.json]`

**Run Ralph autonomous build loop on existing prd.json.**

### When to Use
- You've already run `/prd` and `/prd-json`
- Have an existing `prd.json` ready
- Want to run/resume the build loop

### What It Does
1. Finds `scripts/ralph/prd.json` (or uses provided path)
2. Checks remaining stories
3. Creates Ralph scripts if missing
4. Runs autonomous loop for N iterations
5. Commits on each story completion

### Arguments
- `iterations` (optional): Number of loop iterations (default: remaining × 1.5)
- `path` (optional): Path to prd.json (default: `scripts/ralph/prd.json`)

### Examples
```bash
# Use defaults (auto-calculate iterations)
/build

# Specify iterations
/build 25

# Resume with more iterations
/build 10

# Use specific prd.json
/build 30 projects/feature/prd.json
```

### Workflow
```bash
# Full workflow (separate commands)
/prd "Invoice tracker app"          # Generate PRD
/prd-json docs/prd/invoice-prd.md   # Convert to prd.json
/build                              # Run the loop

# Or all-in-one
/full-build "Invoice tracker app"
```

---

## `/full-build [description]`

**Complete workflow from idea to autonomous execution.**

### When to Use
- Building new product from scratch
- Want full automation
- Starting MVP

### What It Does

**Phase 1: Interview** — Asks 8 questions:
1. Product description
2. Target audience
3. MVP features (3-5 only)
4. Tech stack
5. shadcn/ui style
6. Project name
7. Ralph iterations
8. Auto-start?

**Phase 2: Confirm** — Shows summary, waits for "go"

**Phase 3: Generate PRD** — Full 15-section PRD with 20+ stories

**Phase 4: Convert to Ralph** — Creates prd.json with atomic stories

**Phase 5: Project Setup**
- Creates Next.js project with shadcn
- Sets up Ralph scripts
- Creates CLAUDE.md
- Initialises git

**Phase 6: Launch** — Optionally starts autonomous build

### Example
```bash
/full-build "CRM for UK tradespeople"
# Answers 8 questions
# Type "go" to confirm
# Project created and Ralph running
```

See [RALPH-WALKTHROUGH.md](RALPH-WALKTHROUGH.md) for detailed guide.

---

## `/implement [feature]`

**Execute feature implementation from discovery to completion.**

### When to Use
- Smaller features (not full products)
- Features that don't need Ralph autonomy
- Direct implementation

### What It Does
1. **Discovery** — Checks for PRD, roadmap, assesses complexity
2. **Planning** — Creates task file for medium/large features
3. **Implementation** — TDD cycle (test → implement → refactor)
4. **Quality Gates** — Runs lint, typecheck, tests
5. **Documentation** — Updates README, CLAUDE.md
6. **Completion** — Updates task status, roadmap

### Complexity Assessment
- Small (1-2 files): Implement directly
- Medium (3-5 files): Create task file first
- Large (6+ files): Create PRD, break into subtasks

---

## `/marketing [feature-name]`

**Generate multi-platform marketing content.**

### When to Use
- Feature launch
- Product release
- Need social content

### What It Does
Creates `/marketing/[feature-name]/` with:
- `release-notes.md` — What's new, highlights
- `social-twitter.md` — Tweets and threads
- `social-linkedin.md` — Professional posts
- `social-instagram.md` — Captions and stories
- `email-announcement.md` — Subject lines, body
- `blog-outline.md` — SEO-focused outline

### Example
```bash
/marketing "stripe-billing"
# Creates full content bundle
```

---

## `/project-complete`

**Generate end-of-project documentation suite.**

### When to Use
- Project finished
- Ready for launch
- Need comprehensive docs

### What It Does
Creates `docs/public/` with:
1. `build-journal.md` — Day-by-day chronicle
2. `features.md` — All features documented
3. `marketing-kit.md` — Brand, positioning, pitch
4. `social-content.md` — Ready-to-post content
5. `technical-handoff.md` — Architecture, setup, decisions

---

## `/deploy-check`

**Pre-deployment verification checklist.**

### When to Use
- Before deploying to production
- Release candidate check
- CI/CD verification

### What It Checks
1. **Git** — Correct branch, clean working directory, commits pushed
2. **Code Quality** — Linting, type checking
3. **Tests** — Unit, E2E passing
4. **Build** — Completes without errors
5. **Environment** — Env vars documented
6. **Dependencies** — Security audit, outdated packages
7. **Database** — Migrations current
8. **Documentation** — README, changelog current

### Output
```
DEPLOYMENT READINESS CHECK
==========================
Git:      ✅ main, clean, pushed
Lint:     ✅ No errors
Types:    ✅ No errors
Tests:    ✅ 47/47 passing
Build:    ✅ Successful
Env:      ✅ All documented
Security: ⚠️ 1 low vulnerability
Docs:     ✅ Current

RESULT: READY TO DEPLOY
```
