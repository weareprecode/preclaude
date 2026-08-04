# Commands Reference

Complete reference for all available slash commands.

---

## Quick Reference

| Command | Description | Use When |
|---------|-------------|----------|
| `/copy` | Audit, improve, or generate copy | Need persuasive content |
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
| `/landscape` | Competitive viability report | Honest go/no-go assessment of this product |
| `/graph` | Agent graph runner | Any workflow needing parallel lanes, a skeptic pass, and a human gate |
| `/taste` | Build a taste library | Curating design references you like |
| `/variants` | Design variants side by side | Starting a design, avoiding one-shot output |
| `/tweakbar` | Live tweak panel | Last-mile visual adjustment |
| `/polish` | Polish UI | Match design reference |
| `/refactor` | Refactor code | Improve code structure |
| `/migrate` | Run migrations | Database, deps, framework upgrades |
| `/deps` | Check dependencies | Outdated, security, bundle size |
| `/seo` | Audit SEO | Meta tags, OG, sitemap |
| `/analytics` | Setup analytics | PostHog, GA, Plausible |
| `/stakeholder` | Stakeholder updates | Daily/weekly progress reports |
| `/marketing` | Marketing content | Launch or feature release |
| `/demo` | Demo video pipeline | Recording the week's demo video |
| `/atomise` | Atomise content pillar | Turn one demo + notes into a week's content queue |
| `/launch` | Launch-episode pack | Launching a product or feature |
| `/listen` | Social-listening digest | Daily community engagement |
| `/scorecard` | Weekly marketing scorecard | Reviewing marketing performance |
| `/ugc` | Codex-grounded video ad via Higgsfield | Producing a product/UGC video ad |
| `/offer` | Irresistible offer builder | Packaging or pricing anything |
| `/adfactory` | Ad creative volume engine | Scaling paid ads past the wall |
| `/nurture` | Speed-to-lead + show-rate sequences | Leads not booking or not showing |
| `/moneymodel` | Offer sequencing + CAC payback | Making acquisition self-funding |
| `/valueladder` | Product suite → funnel map | Structuring what you sell |
| `/dream100` | Channel/influencer target list | Finding where customers gather |
| `/webinar` | Presentation funnel script | Webinars, VSLs, launch keynotes |
| `/emailseq` | Story-driven email sequences | Onboarding + broadcast emails |
| `/project-complete` | Full doc suite | Project finished |
| `/deploy-check` | Pre-deploy verification | Before deployment |
| `/doctor` | Diagnose your setup | Commands missing, edits not taking effect |
| `/update` | Update Preclaude | Getting the latest commands and agents |

---

## `/copy [type]`

**Audit existing copy, improve content, or generate new persuasive copy.**

### When to Use
- Auditing existing marketing/landing page copy
- Improving weak headlines, CTAs, or messaging
- Creating sales pages, landing pages, email sequences
- Generating ad copy for campaigns

### Modes

**`/copy audit`** — Scan project for copy and evaluate quality
- Analyses README, landing pages, marketing/, docs/
- Scores each file on clarity, persuasion, voice, CTAs, structure, SEO
- Outputs priority fixes with before/after examples

**`/copy improve [file]`** — Improve specific file's copy
- Identifies weak headlines, passive voice, unclear CTAs
- Rewrites with stronger messaging
- Shows before/after comparison

**`/copy sales-page`** — Generate complete sales page
- Hero, problem, solution, proof, CTA structure
- Testimonial sections, FAQ, pricing

**`/copy landing`** — Generate lead-gen landing page
- Benefit-focused headline
- Form integration
- Trust signals

**`/copy email-sequence`** — Generate email sequence
- Welcome, nurture, sales, or re-engagement
- 5 emails with subject lines and body copy

**`/copy case-study`** — Generate case study template
- Challenge, solution, results structure
- Metrics and testimonials

**`/copy ads`** — Generate ad copy variants
- Google Search, Meta/Facebook, LinkedIn
- Multiple variants for A/B testing

### Examples
```bash
/copy audit                    # Audit all copy in project
/copy improve README.md        # Improve README copy
/copy sales-page              # Generate sales page
/copy email-sequence          # Generate welcome sequence
/copy ads                     # Generate ad copy variants
```

### Output
Saves to `docs/copy/[type]-[date].md`

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
Deep research runs as a diamond graph rather than one self-graded pass:
1. Plans four research lanes with per-lane briefs
2. Runs the lanes as parallel subagents — customers, competitors, distribution, pricing
3. Reads reviews and user feedback, dates every claim
4. Runs a `@skeptic` pass to kill unsupported, stale, or conflated findings
5. Identifies market gaps and builds the recommendation from surviving evidence only

### Output
Creates `docs/research/competitive-analysis.md` with:
- Executive summary
- Competitor analysis with strengths/weaknesses
- Feature comparison matrix
- Market gaps and opportunities
- Skeptic pass — killed, downgraded, and open questions
- Build/Pivot/Don't Build recommendation

### Example
```bash
/research "Invoice tracking app for freelancers"
```

---

## `/graph [question or workflow]`

**Turn any workflow into a managed agent graph — parallel lanes, skeptic pass, merge, human gate.**

### When to Use
- A should-we decision that needs evidence from several angles before you commit
- A workflow you already run with AI weekly (research, content, feedback synthesis)
- A one-shot AI answer you don't fully trust, re-run properly
- NOT for simple tasks — brainstorming names or summarising an email doesn't need a graph

### What It Does
1. Designs the graph first and shows it before running: jobs, arrows, and where the human gate sits
2. Runs parallel lane subagents, each blind to the others, each writing its own file under `docs/graphs/<slug>/`
3. Runs a `@skeptic` pass over all lanes — killed, wounded, survived, unanswered (`review.md`)
4. Merges surviving evidence into `recommendation.md`, including what evidence would change the answer
5. Stops at the human gate — the graph produces the evidence, you make the decision

### Output
A file paper trail in `docs/graphs/<slug>/` (`plan.md`, one file per lane, `review.md`, `recommendation.md`) that stays comparable and reusable across runs.

### Example
```bash
/graph "Should I launch an AI bookkeeping tool for Shopify merchants?"
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

---

## `/demo [target-site or feature]`

**Semi-automated demo video: the agent records the screen demo, you add the voice.**

> Requires Playwright and ffmpeg, plus a `marketing-codex/` workspace.

### When to Use
- Recording the week's demo video
- Showing a feature working for real (no staged output)

### What It Does
1. Checks Playwright and ffmpeg are installed (prints install one-liners if not)
2. Runs the real product flow in a scratch directory and captures actual output — real numbers only
3. Records a 60-90 second screen demo via Playwright (1920x1080), converts to mp4 with ffmpeg
4. Writes `notes.md` into a new pillar folder: the real numbers, one insight, one honest limitation
5. Writes `voiceover.md`: a timed per-scene script (~140 words/minute) to read over the cut

### Example
```bash
/demo stripe.com
# Creates pillar folder with demo.mp4, notes.md, voiceover.md
# Then: record voiceover, run /atomise on the pillar
```

---

## `/atomise [pillar-folder-name]`

**Atomise one content pillar (demo + notes) into the week's platform-native content queue.**

> Requires a `marketing-codex/` workspace (voice guide, funnel, product one-pagers) in or one level above the current directory.

### When to Use
- You've recorded a demo and written notes for the week's content pillar
- Ready to generate the week's posts for review

### What It Does
1. Reads the pillar's `notes.md` and the matching product one-pager — every claim must trace to a source
2. Checks the weekly posting quota before generating (max one original post per platform per day)
3. Generates drafts into the pillar's `outputs/` folder:
   - `linkedin.md` — primary post
   - `x.md` — X version, visual-led
   - `clips.md` — 2-3 clip specs (cuts them with ffmpeg if available)
   - `newsletter-section.md` — 150-250 words
   - `blog.md` — evergreen version with FAQ block
4. Runs a voice check against the banned list (hype, em dashes, unsourced numbers)
5. Optionally queues LinkedIn/X drafts to the posting rail — **drafts only, never publishes**

### Example
```bash
/atomise 2026-07-13-stripe-extraction
```

---

## `/launch [product or product + feature]`

**Generate a complete launch-episode pack for a product or feature.**

> Requires a `marketing-codex/` workspace with a launch checklist and product one-pagers.

### When to Use
- Launching a product or major feature
- Preparing Show HN / Product Hunt / directory submissions

### What It Does
1. Proposes 3 candidate one-sentence "wedges" and recommends one
2. Runs a GO / NO-GO gate check against the launch checklist (verifies live URLs, quickstart)
3. Generates the full pack into `marketing-codex/launches/<slug>/`:
   - `show-hn.md` — title, body, and maker comment
   - `product-hunt.md` — tagline, description, first comment, gallery shot list
   - `directories.md` — pre-filled copy for Uneed, Dev Hunt, Peerlist, BetaList and more
   - `x-thread.md` and `linkedin.md` — launch-day posts
   - `email.md` — list broadcast with 3 subject options
   - `dm-supporters.md` — night-before personal DM template
   - `day-plan.md` — hour-by-hour launch-day timeline
4. Reports the manual actions only a human can do (form submissions, pressing send)

Nothing is submitted, posted or sent by this command.

### Example
```bash
/launch layout
/launch roast "testimonial widgets"
```

---

## `/listen [optional keyword or subreddit]`

**Daily social-listening digest with drafted replies — drafts only, never posts.**

### When to Use
- Daily community engagement (15 minutes)
- Monitoring keywords, competitors, and relevant threads

### What It Does
1. Searches Hacker News (Algolia API) and Reddit (official API or public JSON) for your keyword set — read-only, keyless endpoints
2. Ranks threads: can you genuinely help, is a product mention natural, audience size, freshness
3. Picks the top 5 and drafts a reply for each — help-first, honest, with disclosure-friendly framing
4. Writes the digest to `marketing-codex/listening/YYYY-MM-DD.md` with permalinks and a rewrite-before-posting banner

Replies are raw material to rewrite in your own words — Reddit and HN ban automated posting.

### Example
```bash
/listen
/listen r/reactjs
```

---

## `/scorecard [optional ISO week]`

**Weekly marketing scorecard from Plausible + npm, with 3 recommendations.**

> Requires `PLAUSIBLE_API_TOKEN` and a `marketing-codex/scorecard/targets.md` file.

### When to Use
- Weekly marketing review
- Deciding what to keep or kill

### What It Does
1. Pulls per-site visitors, visits, pageviews, bounce rate — this week vs last week vs 4-week average
2. Adds npm download counts, AI-assistant referrals (ChatGPT, Claude, Perplexity), and a UTM-leak check
3. Counts published content units against the week's quota
4. Writes `marketing-codex/scorecard/weekly/YYYY-WW.md` with a headline table, **three recommendations each tied to a number**, and one keep/kill candidate

Read-only against all APIs; sections with failed API calls are marked DATA MISSING rather than silently dropped.

### Example
```bash
/scorecard          # current week
/scorecard 2026-W28 # regenerate a past week
```

---

## `/landscape [optional focus]`

**Deep competitive landscape + viability assessment of THIS product, published as a website report.**

### When to Use
- Deciding whether to keep building a product
- A competitor just shipped something worrying
- Need an honest go/no-go assessment

### What It Does
1. Runs a parallel multi-agent web research sweep (6-8 dimensions), grounded in the repo's CLAUDE.md/README
2. Builds an adversarial bear case, bull case, and completeness critique, then gap-fills
3. Publishes a polished self-contained HTML report: verdict stamp, moat scorecard, USP, ranked threats, focus plan, go/no-go
4. Saves the verdict to project memory

The report is brutally honest by design — a hedged report is a failed report.

### Example
```bash
/landscape
/landscape "given Figma's latest updates"
```

---

## `/ugc [product or product URL]`

**Generate a codex-grounded product/UGC video ad via Higgsfield (cost-gated, drafts only).**

> Part of the marketing engine module — requires a `marketing-codex/` workspace and Higgsfield access.

### When to Use
- Producing a UGC-style or product video ad
- Turning a winning script (e.g. from `/adfactory`) into rendered video

### What It Does
1. Guided Q&A for avatar and video type, grounded in your marketing codex
2. Estimates generation cost and asks before spending
3. Generates the ad via Higgsfield (Marketing Studio / avatar flows)
4. Saves drafts for approval — never publishes

### Example
```bash
/ugc "Layout — Figma design system extractor"
```

---

## `/offer [product or offer description]`

**Build an irresistible offer — value scoring, offer stack, pricing, guarantees, scarcity, bonuses, and naming.**

### When to Use
- Packaging a new product or service
- An offer that converts poorly or competes on price
- Before writing any sales page, webinar, or ad campaign

### What It Does
1. Scores the market (pain, purchasing power, targetability, growth)
2. Audits the offer against the value equation (outcome × likelihood ÷ time × effort) and finds the weakest lever
3. Builds the offer stack: problems → solutions → delivery vehicles, priced so total value dwarfs the price
4. Adds enhancers: bonuses, guarantee (unconditional/conditional/anti), true scarcity/urgency, and a name via the naming checklist
5. Saves a complete offer doc ready for `/copy`, `/webinar`, or `/moneymodel`

### Example
```bash
/offer "Design-system extraction tool for agency dev teams, currently £49/mo"
# → docs/marketing/offer-[slug]-[date].md
```

---

## `/adfactory [product/offer or path to winning ad]`

**Ad creative volume engine — split winners into hook/meat/CTA and generate dozens of recombined, testable variations.**

### When to Use
- CAC rising when you try to scale spend ("we've saturated the market")
- Producing this week's batch of ad creative
- You have one winning ad and need fifty more

### What It Does
1. Deconstructs your best ad (or drafts a baseline) into callout, hook, meat, CTA
2. Runs the kaleidoscope: 50 hooks across 10 angles, 10 meat frames, 5 CTAs
3. Assembles a starter batch of 15 platform-formatted ads (or video scripts)
4. Adds a weekly testing protocol and scale-past-the-wall rules
5. Pairs with `/ugc` to render winning scripts as video

### Example
```bash
/adfactory docs/copy/ads-spring-campaign.md
/adfactory "quick — CLI tool for indie hackers"
```

---

## `/nurture [business type or lead source]`

**Speed-to-lead and show-rate machine built on the four nurture pillars: availability, speed, personalisation, volume.**

### When to Use
- Paid leads not answering, booking, or showing up
- First-response time measured in hours, not minutes
- No-show rate above 30%

### What It Does
1. Audits your funnel against the four pillars and names the biggest leak
2. Writes the speed-to-lead sequence (first contact in 1-5 minutes)
3. Writes lead-to-booking (8-12 touches, multi-channel), booking-to-show, and no-show recovery sequences — every message verbatim
4. Defines the weekly metrics: contact rate, booking rate, show rate

### Example
```bash
/nurture "demo bookings from Meta ads"
# → docs/marketing/nurture-system-[date].md
```

---

## `/moneymodel [product suite or business]`

**Design the offer sequence — attraction offer, upsell, downsell, continuity — so new customers fund their own acquisition.**

### When to Use
- Ad spend doesn't pay back fast enough to scale
- You sell one thing, once, to each customer
- Deciding what to sell first vs what to sell next

### What It Does
1. Targets customer-financed acquisition: 30-day gross profit ≥ 2× CAC
2. Designs all four slots: attraction offer (win-back, giveaway, decoy, trial…), point-of-purchase upsell, downsell, and continuity
3. Models the 30-day cash maths per 100 customers with labelled assumptions
4. Recommends rollout order (usually: ship the upsell first)

### Example
```bash
/moneymodel "£99 course, considering a membership"
# → docs/marketing/money-model-[date].md
```

---

## `/valueladder [business or product suite]`

**Map everything you sell onto an ascending value ladder, find the gaps, and match the right funnel type to each rung.**

### When to Use
- Structuring a product suite (or realising you only have one product)
- Deciding which funnel to build first
- Customers buy once and have nowhere to ascend

### What It Does
1. Inventories every product on the ladder: bait → frontend → middle → backend → continuity
2. Flags structural gaps (no free rung, cliff jumps, no recurring baseline)
3. Matches funnel types to rungs: lead funnel, tripwire, presentation, application
4. Recommends the ONE funnel to build first, with ascension triggers between rungs

### Example
```bash
/valueladder "SaaS with free tier and £29/mo plan"
# → docs/marketing/value-ladder-[date].md
```

---

## `/dream100 [product + ideal customer]`

**Build the list of ~100 channels, creators and communities where your dream customers already gather — with work-in and buy-in plans.**

### When to Use
- Launching into a market where you have no audience
- Planning partnerships, guest slots, or sponsorships
- Deciding where paid placement money goes

### What It Does
1. Researches real podcasts, newsletters, YouTube channels, communities, influencers, publications and adjacent tools (web-searched, with URLs)
2. Scores each on reach × relevance × accessibility; produces a Top 10, Next 30, and nurture list
3. Writes the work-your-way-in plan per Top-10 target (engage first, value first, ask ladder) with first-touch drafts
4. Writes the buy-your-way-in test plan with budgets

### Example
```bash
/dream100 "design-system tool for indie SaaS founders"
# → docs/marketing/dream100-[date].md
```

---

## `/webinar [offer or path to offer doc]`

**Write a complete presentation-funnel script — one big belief, story-driven objection breaking, stack and close.**

### When to Use
- Selling a £500+ offer that needs more than a sales page
- Writing a webinar, VSL, or launch keynote
- Your presentation teaches well but doesn't sell

### What It Does
1. Defines the One Big Belief the presentation must install, positioned as a new opportunity
2. Maps the three false beliefs (vehicle, internal, external) blocking the sale
3. Writes four epiphany-bridge stories — persuasion by narrative, not argument
4. Assembles the full script: opening (10%), three secrets (60%), stack & close (30%), plus slide outline and registration-page copy

### Example
```bash
/webinar docs/marketing/offer-layout-2026-07-11.md
# → docs/marketing/webinar-script-[date].md
```

---

## `/emailseq [soap-opera|broadcast|diagnose <file>]`

**Story-driven email sequences — serialised onboarding, daily-broadcast episodes, and hook-story-offer diagnostics.**

### When to Use
- New subscribers get one welcome email and then silence
- Your list only hears from you when you're selling
- Existing emails underperform and you don't know why

### What It Does
1. Establishes the attractive character (identity, flaws, voice) emails come from
2. **soap-opera**: 5-email serialised onboarding (stage → drama → epiphany → hidden benefits → urgency), each ending on an open loop
3. **broadcast**: 7 standalone episodes (ordinary moment → pivot → one point → soft CTA)
4. **diagnose**: scores existing emails on hook, story, offer and rewrites the weakest lever

### Example
```bash
/emailseq soap-opera "Preclaude npm installers"
/emailseq diagnose docs/copy/email-sequence-welcome.md
```

---

## `/update`

**Update Preclaude to the latest version.**

### When to Use
- Getting the latest commands, agents, and skills
- After hearing about a new Preclaude release

### What It Does
1. Checks the `~/.preclaude` installation and current version
2. Fetches and pulls the latest from GitHub
3. Lists the new commits since your version
4. Verifies (and repairs) the `~/.claude` symlinks

### Example
```bash
/update
# ✅ Preclaude is up to date
```

---

## The design module

`/taste`, `/variants` and `/tweakbar` are one funnel: curate references, explore wide, then converge. Each works on its own, but the sequence is the intended path. All three read the `design-taste` skill, which holds the aesthetic vocabulary, the four-part brief and the anti-slop guardrails.

The four-part brief is the core idea. Every design prompt carries an **aesthetic** (a named family, not "modern and clean"), a **reference** (image or URL — match the feel, never copy the content), an **intent** (what, for whom, and the one action wanted), and **guardrails** (the always and never list). Miss one and the output regresses to the mean.

---

## `/taste [add <path|url> | review | brief <family>]`

**Build and maintain a library of design references, classified into reusable aesthetic families.**

### When to Use
- Starting to take design seriously and wanting a reference point that isn't the model's default
- You have a folder of screenshots doing nothing
- Before `/variants`, so it has something real to work from

### What It Does
1. Looks at each reference properly — reads the image or fetches the URL
2. Assigns an aesthetic family, inventing a new one where nothing fits
3. Extracts the actual design vocabulary: type pairing, colour behaviour, grid, imagery, motion, texture
4. Writes entries into `.taste/library.json` and a paste-ready brief per family into `.taste/families/`
5. On `review`, audits the library honestly — thin families, misclassifications, dead links, and what's missing given what you build

### Example
```bash
/taste add ~/Desktop/screenshots
/taste add https://example.com
/taste review
```

---

## `/variants [what you're building]`

**Build wide, then narrow — generate design variants side by side and converge deliberately.**

### When to Use
- Any new page or major redesign
- The output "looks AI-generated" and you can't say why
- You don't yet know what direction you want

### What It Does
1. Assembles the four-part brief, pulling from `.taste/` where it exists
2. Builds five complete versions in five genuinely different aesthetic families — **in parallel, one subagent each**, so they don't converge
3. Builds a **contact sheet** at `design-lab/index.html`: all five as live scaled iframes, desktop and mobile, click to open full size
4. You pick one → three body/layout variants of it → you pick one
5. Hero imagery last: four options in place, then colour variations of the winner
6. Hands off to `/tweakbar`

Everything lands in `design-lab/`. Your real pages are never overwritten during exploration.

### Cost
Image generation is the only paid step, and it is gated — the cost is stated and confirmed before any call.

### Example
```bash
/variants "landing page for an AI analytics tool for small startups"
```

---

## `/tweakbar [page | apply]`

**Put the design decisions on sliders, then write the chosen values back into the code.**

### When to Use
- The design is close and the remaining decisions are ones you can only judge by eye
- You keep asking for "more premium" and re-rolling the whole page

### What It Does
1. Reads the page and works out which decisions it actually contains
2. Refactors hard-coded values into CSS custom properties
3. Builds a dev-only panel over them — type, colour, space, shape, motion, and whatever is specific to this page
4. On `apply`, diffs the current values against the originals and writes them into your existing tokens, theme config or design-system file — keeping the semantic names

The panel never ships: it is gated to dev, and the gating is explained when it's installed.

### Example
```bash
/tweakbar app/page.tsx
# ... move sliders in the browser ...
/tweakbar apply
```

---

## `/doctor [install | skills]`

**Diagnose your Preclaude and Claude Code setup.**

### When to Use
- Commands are missing, or edits to a command have no effect
- After an update, or when you're not sure which install is live
- Auditing your own custom commands and skills for quality

### What It Does

**`install`** — dangling symlinks, entries shadowing the install, **both the plugin and the symlink install being live at once** (the most common cause of "my edits do nothing"), invalid settings JSON, version drift against the remote, orphaned `~/.claude-backup-*` directories, and MCP servers awaiting authentication.

**`skills`** — audits every command, agent and skill for structural failures (missing frontmatter, name/directory mismatch, absent description) and quality problems: descriptions that never say *when* to use the thing, over-prescriptive step-by-step scripts that stronger models deviate from, excessive length, and colliding descriptions.

It diagnoses first and fixes second. Nothing under `~/.claude` is modified without confirming that specific change.

### Example
```bash
/doctor
/doctor skills
```
