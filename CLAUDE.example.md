# Global Claude Configuration

## About
<!-- Customise this section with your details -->
Your name or company. What you build.

## Preferences

### Code Style
- TypeScript strict mode, no `any`
- Functional components, hooks only
- Tailwind CSS for styling
- Colocated tests (ComponentName.test.tsx next to ComponentName.tsx)
- Named exports for components, default for pages

### Communication
- Concise responses, no fluff
- Show code, explain briefly
- Flag assumptions explicitly

### Workflow
- TDD when practical (test -> implement -> refactor)
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

## Commands Available
- `/learn` - Analyse session, propose CLAUDE.md updates
- `/commit` - Conventional commit from staged changes
- `/kickoff [name]` - Initialise new project
- `/prd [description]` - Generate comprehensive technical PRD
- `/ralph [prd-path]` - Convert PRD to autonomous execution format
- `/full-build [description]` - Complete workflow: PRD -> Ralph -> Build
- `/implement [feature]` - Full feature implementation
- `/review` - Code review current changes
- `/marketing [feature]` - Generate marketing content
- `/project-complete` - Generate full doc suite (journal, features, marketing)
- `/handoff` - Session handoff notes
- `/deploy-check` - Pre-deployment checklist

## Agents Available
Invoke with @agent-name for specialised tasks:
- `@frontend-developer` - React, Next.js, UI
- `@backend-developer` - APIs, databases
- `@database-architect` - Schema, queries
- `@devops-engineer` - CI/CD, infrastructure
- `@security-auditor` - Security review
- `@test-engineer` - Testing
- `@code-reviewer` - Code review
- `@technical-writer` - Documentation
- `@ui-designer` - Design systems
- `@product-analyst` - PRDs, requirements

## Response Format
- Get to the point
- Code blocks with language specified
- One recommendation, not a menu of options (unless asked)
- If unsure, say so and ask
