---
description: Initialize new project with full structure, CLAUDE.md, and tooling
allowed-tools: Read, Write, Bash(*), Glob
argument-hint: [project-name]
---

# Project Kickoff: $ARGUMENTS

Initialize a new project with production-ready structure.

## Step 1: Gather Requirements

Before scaffolding, clarify:

1. **Project type**: Web app / Mobile app / API / Full-stack / Package
2. **Primary framework**: Next.js / React Native / Node API / Other
3. **Database**: PostgreSQL / Supabase / MongoDB / None
4. **Auth**: Better Auth / Supabase Auth / Clerk / None
5. **Key integrations**: Stripe / SendGrid / S3 / Other

If $ARGUMENTS doesn't include these, ask before proceeding.

## Step 2: Create Directory Structure

```
$ARGUMENTS/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .claude/
│   ├── settings.json
│   └── commands/           # Project-specific commands
├── docs/
│   ├── prd/               # Product requirements
│   ├── design/            # Technical decisions
│   └── handoff/           # Session notes
├── src/
│   ├── app/               # Next.js App Router (if web)
│   ├── components/
│   ├── lib/
│   └── api/               # API routes or standalone
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── reference/
│   ├── ROADMAP.md
│   └── BUGS.md
├── .env.example
├── .gitignore
├── CLAUDE.md
├── README.md
├── package.json
└── tsconfig.json
```

## Step 3: Create CLAUDE.md

```markdown
# [Project Name]

## Overview
[One-line description]

## Stack
- **Frontend**: [framework, styling]
- **Backend**: [runtime, framework]
- **Database**: [type, ORM]
- **Infrastructure**: [hosting, services]

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint and format
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
```

## Directory Structure
- `src/app/` — Pages and layouts
- `src/components/` — React components
- `src/lib/` — Utilities and helpers
- `src/api/` — API routes

## Development Workflow
1. Check ROADMAP.md for current task
2. Create/update task file in docs/
3. Implement with tests
4. Run quality checks: `npm run lint && npm run test`
5. Commit with conventional message
6. Update ROADMAP.md

## Gotchas
[Add as discovered]
```

## Step 4: Initialize Git

```bash
cd $ARGUMENTS
git init
git add .
git commit -m "chore: initial project setup"
```

## Step 5: Install Dependencies

Based on selected stack, install appropriate packages.

## Step 6: Output Summary

```
PROJECT INITIALIZED: $ARGUMENTS
===============================

📁 Structure created
📝 CLAUDE.md configured  
🔧 Dependencies installed
📋 Git initialized

Next steps:
1. cd $ARGUMENTS
2. Copy .env.example to .env and fill values
3. Run: npm run dev
4. Start with: /implement [first-feature]
```
