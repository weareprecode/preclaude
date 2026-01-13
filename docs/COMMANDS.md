# Commands Reference

Complete reference for all available slash commands.

---

## Quick Reference

| Command | Description | Use When |
|---------|-------------|----------|
| `/commit` | Conventional commit | Ready to commit staged changes |
| `/pr` | Create pull request | Branch ready for PR |
| `/review` | Code review | Before PR or after changes |
| `/test` | Generate tests | Need tests for existing code |
| `/debug` | Analyse errors | Have error or stack trace |
| `/status` | Quick health check | Check git, lint, types, tests |
| `/learn` | CLAUDE.md updates | End of session |
| `/handoff` | Session notes | Stopping work mid-task |
| `/kickoff` | New project | Starting fresh project |
| `/prd` | Generate PRD | Planning new feature |
| `/prd-json` | PRD to JSON | Preparing for autonomous build |
| `/build` | Run Ralph loop | Have prd.json, ready to build |
| `/full-build` | Complete workflow | New product from scratch |
| `/implement` | Feature build | Smaller features |
| `/research` | Deep web research | Market research, competitor analysis |
| `/polish` | Polish UI | Match design reference |
| `/refactor` | Refactor code | Improve code structure |
| `/migrate` | Run migrations | Database, deps, framework upgrades |
| `/deps` | Check dependencies | Outdated, security, bundle size |
| `/seo` | Audit SEO | Meta tags, OG, sitemap |
| `/analytics` | Setup analytics | PostHog, GA, Plausible |
| `/stakeholder` | Stakeholder updates | Daily/weekly progress reports |
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
1. **Asks which Ralph mode** to use (see below)
2. Finds `scripts/ralph/prd.json` (or uses provided path)
3. Checks remaining stories
4. Runs autonomous loop
5. Commits on each story completion

### Ralph Modes

When you run `/build`, you'll be asked to choose:

| Mode | Description | Best For |
|------|-------------|----------|
| **Same context** (Recommended) | All stories in one session. Claude remembers previous work and failures. | Short builds (<15 stories), interdependent features |
| **Fresh context** | Spawns new Claude per story. Clean slate each iteration. | Long builds (20+), overnight runs, independent features |

**Same context** uses the Anthropic Ralph plugin with a Stop hook that keeps the session alive between stories.

**Fresh context** uses the original Geoffrey Huntley approach — a bash loop that runs `claude --print` per iteration, giving each story a clean context window.

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

**Phase 1: Interview** — Asks 9-10 questions:
1. Product description
2. Target audience
3. MVP features (3-5 only)
4. Tech stack
5. shadcn/ui style
6. Project name
7. Ralph iterations
8. Auto-start?
9. Ralph mode? (same context vs fresh context)

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

### What It Does
1. **Detects package manager** from lockfile (bun, pnpm, yarn, or npm)
2. Runs all checks using the detected package manager

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

---

## `/pr [base-branch]`

**Create pull request from current branch with auto-generated description.**

### When to Use
- Feature branch ready for review
- Need PR description generated from commits

### What It Does
1. Gathers commit history since branching
2. Analyses changed files and categorises them
3. Generates PR title and description
4. Pushes branch if needed
5. Creates PR via GitHub CLI

### Output Format
```markdown
## Summary
[2-3 bullet points describing what this PR does]

## Changes
- [Specific change 1]
- [Specific change 2]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Types check
- [ ] Manually tested
```

### Example
```bash
/pr main
# Creates PR from current branch to main
```

---

## `/test [file-or-component]`

**Generate tests for existing code — unit, integration, or E2E.**

### When to Use
- Code exists without tests
- Adding test coverage
- TDD refactoring

### What It Does
1. Identifies target (file, component, or untested files)
2. Detects testing framework (Vitest, Jest, Playwright)
3. Analyses code for testable scenarios
4. Generates tests following project patterns
5. Runs tests to verify

### Test Types
- **Components**: Renders, interactions, states, accessibility
- **Functions**: Inputs, outputs, edge cases, errors
- **API Routes**: Request/response, auth, validation
- **Server Actions**: Form handling, revalidation

### Example
```bash
/test src/components/Button.tsx
# Creates: src/components/Button.test.tsx
```

---

## `/debug [error-message]`

**Analyse error messages and suggest fixes.**

### When to Use
- Have error message or stack trace
- Debugging runtime errors
- Understanding cryptic errors

### What It Does
1. Parses error type and message
2. Extracts file location and line number
3. Searches codebase for related code
4. Diagnoses root cause
5. Provides fix with code examples

### Common Error Types Handled
- `TypeError`, `SyntaxError`, `ReferenceError`
- Module not found / import errors
- Hydration mismatches
- Prisma database errors
- Next.js specific errors

### Example
```bash
/debug "Cannot read properties of undefined (reading 'map')"
```

---

## `/status`

**Quick project health check — git, lint, types, tests in one view.**

### When to Use
- Quick project overview
- Before committing
- After pulling changes

### What It Does
1. **Detects package manager** from lockfile (bun, pnpm, yarn, or npm)
2. Runs all checks using the detected package manager:
   - Git status (branch, ahead/behind, uncommitted)
   - TypeScript type checking
   - ESLint linting
   - Test suite

### Output Format
```
═══════════════════════════════════════════════════════════════
📊 PROJECT STATUS
═══════════════════════════════════════════════════════════════

📁 GIT
Branch: feature/new-feature
Ahead/Behind: +3 / -0
Uncommitted: 2 files

📝 TYPECHECK
✅ Types OK

🔍 LINT
✅ Lint OK

🧪 TESTS
✅ Tests pass
═══════════════════════════════════════════════════════════════
```

---

## `/research [idea]`

**Deep web research on competitors, market gaps, and idea validation.**

### When to Use
- Before building a new product
- Competitive analysis
- Market validation
- Finding opportunities

### What It Does
1. Identifies search terms from idea
2. Finds 10+ competitors via web search
3. Analyses each competitor's features, pricing, UX
4. Reads reviews and user feedback
5. Identifies market gaps and opportunities
6. Generates comprehensive report

### Output
Creates `docs/research/competitive-analysis.md` with:
- Executive summary
- Competitor analysis with strengths/weaknesses
- Feature comparison matrix
- Market gaps and opportunities
- Build/Pivot/Don't Build recommendation

### Example
```bash
/research "Invoice tracking app for freelancers"
```

---

## `/polish [component]`

**Polish UI to match a design reference — URL, Figma, or screenshot.**

### When to Use
- Matching design mockup
- Improving UI quality
- Extracting design tokens

### What It Does
1. Identifies target component/page
2. Extracts design system from reference:
   - URL: Fetches and analyses styles
   - Figma: Uses Figma API for tokens
   - Screenshot: Analyses visually
3. Compares current vs reference
4. Applies polish changes (colours, typography, spacing, effects)

### Common Polish Patterns
- Better buttons (hover, focus, active states)
- Better cards (shadows, borders, hover)
- Better inputs (focus rings, transitions)
- Smooth micro-interactions

### Example
```bash
/polish src/components/Header.tsx
# Asks for design reference, then applies polish
```

---

## `/refactor [file]`

**Refactor code — extract components, improve types, split files.**

### When to Use
- File growing too large
- Repeated code patterns
- Improving type safety
- Cleaning up code

### What It Does
1. Identifies refactoring type needed
2. Analyses current code for smells
3. Applies refactoring pattern:
   - Extract component
   - Extract custom hook
   - Split large file
   - Improve types
   - Clean up dead code

### Code Smell Detection
- Files over 300 lines
- Components with 5+ useState hooks
- Repeated code patterns
- Mixed concerns
- `any` types
- Deep nesting

### Example
```bash
/refactor src/pages/Dashboard.tsx
```

---

## `/migrate [type]`

**Run migrations — database schema, API versions, major dependency upgrades.**

### When to Use
- Database schema changes
- Next.js version upgrade
- React version upgrade
- Major dependency updates

### Migration Types

**Database (Prisma/Drizzle)**
- Generate and run migrations
- Handle breaking changes safely
- Rollback strategies

**Next.js Upgrade**
- Update packages
- Fix breaking changes
- Pages Router → App Router migration

**React Upgrade**
- Update React and types
- Handle API changes (forwardRef, use hook)

**Dependencies**
- Read changelogs
- Fix breaking changes
- Full verification

### Example
```bash
/migrate database
/migrate nextjs
/migrate react
```

---

## `/deps`

**Check dependencies — outdated packages, security vulnerabilities, bundle size.**

### When to Use
- Regular maintenance
- Security audit
- Before major updates
- Bundle optimisation

### What It Does
1. Lists outdated packages
2. Runs security audit
3. Categorises updates by risk (patch/minor/major)
4. Checks bundle sizes
5. Finds unused dependencies
6. Generates safe update script

### Output
```markdown
## 📊 Dependency Report

### Security Status
🔴 Critical: 0
🟠 High: 1
🟡 Moderate: 2

### Update Status
- Patch available: 5
- Minor available: 3
- Major available: 2

### Recommended Actions
1. `npm audit fix`
2. `npm update`
3. Review [package] major update
```

---

## `/seo [audit|fix]`

**Audit and fix SEO essentials — meta tags, Open Graph, favicon, sitemap, robots.txt.**

### When to Use
- New project setup
- Pre-launch check
- SEO audit

### What It Checks
- Page title and meta description
- Open Graph tags
- Twitter card tags
- Favicon and Apple Touch Icon
- Sitemap
- Robots.txt
- Canonical URLs
- Structured data

### What It Creates (if missing)
- Metadata in layout.tsx
- sitemap.ts
- robots.ts
- icon.tsx (dynamic favicon)
- OG image prompt/template

### Example
```bash
/seo audit    # Check current status
/seo fix      # Create missing items
```

---

## `/analytics [provider]`

**Check and setup analytics — PostHog, Google Analytics, Plausible.**

### When to Use
- New project needs analytics
- Checking current setup
- Switching providers

### Supported Providers
- **PostHog** (recommended): Product analytics, session replay, feature flags
- **Google Analytics**: Marketing metrics, widely used
- **Plausible**: Privacy-focused, lightweight
- **Vercel Analytics**: Built-in for Vercel hosting

### What It Does
1. Checks for existing analytics
2. Asks which provider to install
3. Creates provider component and pageview tracker
4. Updates layout with provider
5. Creates event helper functions

### Example
```bash
/analytics posthog
/analytics check    # Audit current setup
```

---

## `/stakeholder [daily|weekly|pack]`

**Generate stakeholder updates — daily/weekly progress reports with metrics.**

### When to Use
- Daily standup notes
- Weekly status reports
- Stakeholder presentations

### Update Types

**Daily Update**
- Completed today
- In progress
- Tomorrow's focus
- Blockers

**Weekly Report**
- Summary metrics
- Completed features
- Screenshots/demos
- Next week's plan
- Risks and blockers

**Full Stakeholder Pack**
- Executive summary
- Progress metrics
- Timeline
- Budget tracking
- Risks and issues
- Decisions needed

### Example
```bash
/stakeholder daily
/stakeholder weekly
/stakeholder pack
```

Saves to `docs/updates/`
