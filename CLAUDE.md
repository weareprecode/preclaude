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
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind, shadcn/ui
- **Backend**: Node.js, Hono or Express, Prisma
- **Database**: PostgreSQL (Supabase for speed)
- **Mobile**: React Native with Expo
- **Hosting**: Vercel (web), Railway (backend)
- **Auth**: Better Auth or Supabase Auth

## Commands Available (24)
- `/full-build [description]` — Complete workflow: PRD → Ralph → Build
- `/implement [feature]` — Full feature implementation
- `/prd [description]` — Generate comprehensive technical PRD
- `/kickoff [name]` — Initialize new project
- `/ralph [prd-path]` — Convert PRD to autonomous execution format
- `/build` — Run Ralph autonomous build loop on existing prd.json
- `/research [idea]` — Deep research on competitors, market gaps, idea validation
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
- `/stakeholder [type]` — Generate stakeholder updates: daily, weekly, or full pack
- `/project-complete` — Generate full doc suite (journal, features, marketing)
- `/handoff` — Session handoff notes
- `/deploy-check` — Pre-deployment checklist

## Agents Available (15)
Invoke with @agent-name for specialized tasks:
- `@frontend-developer` — React, Next.js, UI components, state management
- `@backend-developer` — APIs, server-side logic, database operations
- `@database-architect` — Schema design, queries, migrations, indexing
- `@devops-engineer` — CI/CD, Docker, Kubernetes, infrastructure
- `@security-auditor` — Security reviews, vulnerability analysis
- `@test-engineer` — Unit tests, integration tests, E2E tests
- `@code-reviewer` — Code review, best practices
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
