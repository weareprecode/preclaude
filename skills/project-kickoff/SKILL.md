---
name: project-kickoff
description: Initialises new projects with production-ready structure, tooling, and Claude-optimised documentation — directory scaffold, CLAUDE.md, ROADMAP.md, .env.example, CI workflow, and package scripts for Next.js, API-only, or Expo stacks. Use when starting a new project from scratch, setting up a new client project, converting a prototype to production structure, or initialising a new microservice.
---

# Project Kickoff

## Purpose
Initialize new projects with production-ready structure, proper tooling configuration, and Claude-optimized documentation.

## When to Invoke
- Starting a new project from scratch
- Converting a prototype to production structure
- Setting up a new client project
- Initializing a new microservice

---

## Pre-Flight Checklist

Before scaffolding, clarify:

| Question | Options | Default |
|----------|---------|---------|
| Project type | Web / Mobile / API / Full-stack / Package | Full-stack |
| Frontend | Next.js / React / React Native / Vue / None | Next.js latest stable major (16+ at time of writing) |
| Backend | Node (Hono/Express) / Python / Go / None | Node + Hono |
| Database | PostgreSQL / Supabase / MongoDB / SQLite / None | Supabase |
| Auth | Better Auth / Supabase Auth / Clerk / None | Better Auth |
| Styling | Tailwind / CSS Modules / Styled Components | Tailwind |
| Testing | Vitest / Jest / Playwright | Vitest + Playwright |
| Hosting target | Vercel / Railway / AWS / Self-hosted | Vercel |

---

## Directory Structure

### Full-Stack Web App (Next.js)
```
project-name/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── preview.yml
├── .claude/
│   ├── settings.json
│   └── commands/
├── docs/
│   ├── prd/
│   ├── design/
│   └── handoff/
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/           # Base UI components
│   │   └── features/     # Feature-specific components
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   └── styles/
│       └── globals.css
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── reference/
│   ├── ROADMAP.md
│   └── BUGS.md
├── .env.example
├── .env.local           # gitignored
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── CLAUDE.md
├── README.md
├── components.json      # shadcn config
├── next.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### API Only (Node + Hono)
```
project-name/
├── .github/workflows/
├── .claude/
├── docs/
├── src/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── db/
│   │   ├── schema.ts
│   │   └── migrations/
│   ├── types/
│   ├── utils/
│   └── index.ts
├── tests/
├── reference/
├── .env.example
├── CLAUDE.md
├── package.json
└── tsconfig.json
```

### React Native (Expo)
```
project-name/
├── .github/workflows/
├── .claude/
├── docs/
├── app/                  # Expo Router
│   ├── (tabs)/
│   ├── (auth)/
│   ├── _layout.tsx
│   └── index.tsx
├── components/
├── hooks/
├── lib/
├── constants/
├── assets/
├── reference/
├── .env.example
├── app.json
├── CLAUDE.md
├── package.json
└── tsconfig.json
```

---

## Essential Files

### CLAUDE.md Template
```markdown
# [Project Name]

## Overview
[One-line description]

## Stack
- **Frontend**: [framework, version]
- **Backend**: [runtime, framework]
- **Database**: [type, ORM]
- **Auth**: [provider]
- **Hosting**: [platform]

## Commands
\`\`\`bash
npm run dev          # Start development
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
npm run db:push      # Push schema changes
npm run db:studio    # Open database GUI
\`\`\`

## Directory Guide
- `src/app/` — Pages and API routes
- `src/components/ui/` — Base UI components (shadcn)
- `src/components/features/` — Feature components
- `src/lib/` — Utilities, db client, auth config
- `src/hooks/` — Custom React hooks
- `src/types/` — TypeScript types

## Development Workflow
1. Check `reference/ROADMAP.md` for current task
2. Create task file if needed
3. Implement with tests
4. Run `npm run lint && npm run test`
5. Commit with conventional message
6. Update ROADMAP

## Conventions
- Components: PascalCase (`UserProfile.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase with suffix (`UserProfileProps`)
- API routes: kebab-case (`/api/user-profile`)

## Gotchas
[Add as discovered during development]
```

### .env.example Template
```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Auth
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Third-party (add as needed)
# STRIPE_SECRET_KEY=
# RESEND_API_KEY=
```

### ROADMAP.md Template
```markdown
# Development Roadmap

## Active Development
<!-- Current sprint tasks -->

## Up Next
<!-- Prioritized backlog -->

## Completed
<!-- Done items with dates -->

## Icebox
<!-- Ideas for later -->
```

### CI Workflow (.github/workflows/ci.yml)
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run tsc --noEmit
      - run: npm run test
      - run: npm run build
```

---

## Package.json Scripts

### Next.js Full-Stack
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint && prettier --check .",
    "lint:fix": "next lint --fix && prettier --write .",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest --coverage",
    "tsc": "tsc",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

### API Only
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts",
    "start": "node dist/index.js",
    "lint": "eslint . && prettier --check .",
    "lint:fix": "eslint --fix . && prettier --write .",
    "test": "vitest",
    "tsc": "tsc --noEmit"
  }
}
```

---

## Initialization Steps

### 1. Create Structure
```bash
mkdir -p project-name/{.github/workflows,.claude/commands,docs/{prd,design,handoff},src,tests/{unit,integration,e2e},reference}
cd project-name
```

### 2. Initialize Package
```bash
npm init -y
```

### 3. Install Dependencies
Based on selected stack, install appropriate packages.

### 4. Configure TypeScript
Create `tsconfig.json` with strict mode.

### 5. Configure Linting
Create `.eslintrc.json` and `.prettierrc`.

### 6. Create Documentation
Generate CLAUDE.md, README.md, ROADMAP.md.

### 7. Initialize Git
```bash
git init
git add .
git commit -m "chore: initial project setup"
```

### 8. Verify Setup
```bash
npm run lint
npm run tsc --noEmit
npm run dev
```

---

## Post-Kickoff Checklist

- [ ] Project runs with `npm run dev`
- [ ] TypeScript compiles without errors
- [ ] Linting passes
- [ ] Git initialized with first commit
- [ ] CLAUDE.md populated
- [ ] README has setup instructions
- [ ] .env.example documents all variables
- [ ] CI workflow added
- [ ] ROADMAP.md ready for tasks

---

## Output Summary

```
PROJECT INITIALIZED: [name]
===========================

📁 Structure created
📦 Dependencies installed ([N] packages)
📝 Documentation generated
🔧 Tooling configured
📋 Git initialized

Files created:
- CLAUDE.md
- README.md
- reference/ROADMAP.md
- .env.example
- [config files]

Next steps:
1. cd [project-name]
2. cp .env.example .env.local
3. Fill in environment variables
4. npm run dev
5. /implement [first-feature]
```
