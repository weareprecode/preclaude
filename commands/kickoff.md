---
description: Initialize new project with full structure, CLAUDE.md, and tooling
allowed-tools: Read, Write, Bash, Glob
argument-hint: [project-name]
---

# Project Kickoff: $ARGUMENTS

Initialize a new project with production-ready structure.

## Step 1: Gather Requirements (Sequential Questions)

**IMPORTANT**: Ask ONE question at a time using the AskUserQuestion tool. Wait for each response before asking the next.

### Question Flow

**Question 1: Project Type**
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "What type of project are you building?",
    "header": "Type",
    "options": [
      {"label": "Full-stack Web (Recommended)", "description": "Next.js with API routes and database"},
      {"label": "Web App (Frontend Only)", "description": "Next.js or React without backend"},
      {"label": "Mobile App", "description": "React Native with Expo"},
      {"label": "API Only", "description": "Node.js backend without frontend"}
    ],
    "multiSelect": false
  }]
}
```

**Question 2: Database**
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Which database would you like to use?",
    "header": "Database",
    "options": [
      {"label": "Supabase (Recommended)", "description": "PostgreSQL with real-time, auth, and storage built-in"},
      {"label": "PostgreSQL", "description": "Self-managed PostgreSQL with Prisma/Drizzle"},
      {"label": "MongoDB", "description": "NoSQL document database"},
      {"label": "None", "description": "No database needed"}
    ],
    "multiSelect": false
  }]
}
```

**Question 3: Authentication**
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Which authentication solution?",
    "header": "Auth",
    "options": [
      {"label": "Better Auth (Recommended)", "description": "Simple, flexible auth with social providers"},
      {"label": "Supabase Auth", "description": "Built-in auth if using Supabase"},
      {"label": "Clerk", "description": "Managed auth with UI components"},
      {"label": "None", "description": "No authentication needed"}
    ],
    "multiSelect": false
  }]
}
```

**Question 4: Key Integrations**
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Any key integrations needed? (Select all that apply)",
    "header": "Integrations",
    "options": [
      {"label": "Stripe", "description": "Payments and subscriptions"},
      {"label": "Resend", "description": "Transactional emails"},
      {"label": "S3/R2", "description": "File storage"},
      {"label": "None", "description": "No integrations needed yet"}
    ],
    "multiSelect": true
  }]
}
```

### After All Questions

Parse selections into project configuration, then proceed with scaffolding.

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
