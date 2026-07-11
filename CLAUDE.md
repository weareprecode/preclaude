# Global Claude Configuration

## About
UK-based digital product agency. Rapid MVP development and 5-Day UX Sprints.

## Preferences

### Code Style
- TypeScript strict mode, no `any`
- Functional components, hooks only
- Tailwind CSS for styling
- Colocated tests (ComponentName.test.tsx next to ComponentName.tsx)
- Named exports for components, default for pages

### Communication
- British English spelling (colour, behaviour, organise)
- Concise responses, no fluff
- Show code, explain briefly
- Flag assumptions explicitly

### Workflow
- TDD when practical (test → implement → refactor)
- Small, focused commits with conventional messages
- Update docs as you go, not at the end
- Create handoff notes at session end

## Stack Defaults
When not specified by project, prefer:
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js (LTS), Hono or Express, Prisma
- **Database**: PostgreSQL (Supabase for speed)
- **Mobile**: React Native with Expo
- **Hosting**: Vercel (web), Railway (backend)
- **Auth**: Better Auth or Supabase Auth

**Always start on the latest stable major.** At kickoff, scaffold with `@latest` (`npx create-next-app@latest`, latest Tailwind) and use the current stable major of each framework (Next.js 16+, React 19+, Tailwind v4+ as of 2026). Only pin behind latest for a concrete blocker, and note why in the project's CLAUDE.md.

## Commands Available (42)
- `/full-build [description]` — Complete workflow: PRD → prd.json → Build (Ralph Wiggum)
- `/implement [feature]` — Full feature implementation
- `/prd [description]` — Generate comprehensive technical PRD
- `/kickoff [name]` — Initialize new project
- `/prd-json [prd-path]` — Convert PRD to prd.json for autonomous build
- `/build` — Run Ralph Wiggum autonomous loop (choose: same context or fresh context per story)
- `/research [idea]` — Deep research on competitors, market gaps, idea validation
- `/landscape [focus]` — Competitive landscape + viability assessment, published as a website report
- `/copy [type]` — Audit, improve, or generate copy (sales pages, landing pages, emails, ads)
- `/commit` — Conventional commit from staged changes
- `/pr [base-branch]` — Create pull request with auto-generated description
- `/review` — Code review current changes
- `/test [file]` — Generate tests for existing code
- `/debug [error]` — Analyse error messages and suggest fixes
- `/status` — Quick health check: git, lint, types, tests
- `/polish [component]` — Polish UI to match design reference (URL, Figma, screenshot)
- `/refactor [file]` — Refactor code: extract components, improve types, split files
- `/migrate [type]` — Run migrations: database, Next.js, dependencies
- `/deps` — Check dependencies: outdated, security vulnerabilities, bundle size
- `/seo` — Audit and fix SEO: meta tags, Open Graph, favicon, sitemap
- `/analytics` — Check and setup analytics: PostHog, GA, Plausible
- `/learn` — Analyze session, propose CLAUDE.md updates
- `/marketing [feature]` — Generate marketing content
- `/demo [target]` — Semi-automated demo video: agent records the screen, you add voice
- `/atomise [pillar]` — Atomise one pillar (demo + notes) into the week's content queue
- `/launch [product]` — Full launch pack: Show HN, Product Hunt, directories, posts, email
- `/listen [keyword]` — Daily social-listening digest with drafted replies (never posts)
- `/scorecard [week]` — Weekly marketing scorecard from Plausible + npm with recommendations
- `/ugc [product]` — Codex-grounded product/UGC video ad via Higgsfield (cost-gated, drafts only)
- `/offer [product]` — Irresistible offer builder: value scoring, stack, pricing, guarantees, naming
- `/adfactory [product|ad-file]` — Ad creative volume engine: hook/meat/CTA variations + testing protocol
- `/nurture [lead source]` — Speed-to-lead and show-rate sequences (respond, schedule, show)
- `/moneymodel [business]` — Sequence attraction offer, upsells, downsells, continuity for CAC payback
- `/valueladder [business]` — Map products onto a value ladder and match funnels to rungs
- `/dream100 [product + customer]` — List of channels/creators where dream customers gather, with outreach plans
- `/webinar [offer]` — Presentation-funnel script: one big belief, stories, stack and close
- `/emailseq [mode]` — Story-driven email sequences: soap-opera onboarding, broadcasts, diagnostics
- `/stakeholder [type]` — Generate stakeholder updates: daily, weekly, or full pack
- `/project-complete` — Generate full doc suite (journal, features, marketing)
- `/handoff` — Session handoff notes
- `/deploy-check` — Pre-deployment checklist
- `/update` — Update Preclaude to the latest version

## Agents Available (18)
Invoke with @agent-name for specialized tasks:
- `@frontend-developer` — React, Next.js, UI components, state management
- `@backend-developer` — APIs, server-side logic, database operations
- `@database-architect` — Schema design, queries, migrations, indexing
- `@devops-engineer` — CI/CD, Docker, Kubernetes, infrastructure
- `@security-auditor` — Security reviews, vulnerability analysis
- `@test-engineer` — Unit tests, integration tests, E2E tests
- `@code-reviewer` — Code review, best practices
- `@copywriter` — Brand voice, sales pages, landing pages, email sequences, ad copy
- `@ai-engineer` — Claude API, Agent SDK, RAG pipelines, LLM features
- `@data-analyst` — SQL, product analytics, funnels, A/B tests, dashboards
- `@technical-writer` — Documentation, guides, tutorials
- `@ui-designer` — Design systems, accessibility, animations
- `@ux-researcher` — User research, usability testing
- `@product-analyst` — PRDs, user stories, requirements
- `@performance-engineer` — Core Web Vitals, bundle analysis, optimisation
- `@expo-developer` — React Native with Expo
- `@ios-developer` — Swift, iOS development
- `@android-developer` — Kotlin, Android development

## Response Format
- No yapping — get to the point
- Code blocks with language specified
- One recommendation, not a menu of options (unless asked)
- If unsure, say so and ask
