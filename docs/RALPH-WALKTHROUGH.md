# Ralph Autonomous Build Walkthrough

Complete step-by-step guide to building a product autonomously using Ralph.

> **Attribution**: The Ralph Wiggum autonomous build loop was created by [Geoffrey Huntley](https://github.com/ghuntley). Original plugin: [Ralph Wiggum](https://github.com/anthropics/claude-code/tree/main/plugins/official/ralph-loop)

---

## What is Ralph?

Ralph is an autonomous build loop that:
1. Reads a structured `prd.json` with user stories
2. Implements one story per iteration
3. Runs quality checks (typecheck, lint, tests)
4. Commits on success
5. Moves to next story
6. Repeats until complete

Each iteration is a fresh Claude context, so stories must be atomic and self-contained.

---

## Quick Start (5 minutes)

```bash
# 1. Start Claude Code in empty directory
claude

# 2. Run full-build
/full-build "Invoice tracker for freelancers"

# 3. Answer the 8 questions
# 4. Type "go" to confirm
# 5. Watch it build
```

---

## Full Walkthrough

### Step 1: Start with an Idea

You need:
- Clear product description
- Target audience
- 3-5 MVP features (be ruthless)

**Example:**
> "A mobile CRM for UK tradespeople. Simple job tracking, invoicing, and customer management. Target: solo plumbers, electricians, builders who aren't tech-savvy."

### Step 2: Run /full-build

```bash
/full-build "Mobile CRM for UK tradespeople"
```

Claude will ask 8 questions:

#### Question 1: Product Description
```
What are you building? Describe the core functionality and value proposition.
```
**Your answer:** "A mobile-first CRM for UK tradespeople. Track jobs from enquiry to payment, send professional invoices, manage customer database. Simple enough for non-technical users."

#### Question 2: Target Audience
```
Who will use this? What's their technical sophistication?
```
**Your answer:** "Solo tradespeople and small trade businesses (1-5 people). Plumbers, electricians, builders. Not very technical - need dead simple UX. Mobile-first, often on job sites."

#### Question 3: MVP Features
```
What MUST be in v1? Everything else is v2. Be ruthless.
```
**Your answer:**
- User auth (email/password)
- Job CRUD (create, view, edit, delete)
- Basic invoicing (generate PDF)
- Customer list
- Mobile-responsive

#### Question 4: Tech Stack
```
Any specific requirements? Or use our defaults?
```
**Your answer:** "defaults" (or specify changes)

#### Question 5: shadcn Style
```
Do you have a preset URL from https://ui.shadcn.com?
```
**Your answer:** "lyra" (or paste your preset URL)

#### Question 6: Project Name
```
What should the folder/repo be called?
```
**Your answer:** "tradesperson-crm"

#### Question 7: Ralph Iterations
```
How many autonomous build iterations?
```
**Your answer:** "25" (or "auto")

#### Question 8: Auto-Start
```
After setup, should I start Ralph immediately?
```
**Your answer:** "yes"

### Step 3: Confirm and Go

Claude shows a summary:

```
✅ Confirm Project Setup

| Setting | Value |
|---------|-------|
| Product | tradesperson-crm |
| Audience | Solo tradespeople |
| shadcn Style | lyra |
| Iterations | 25 |
| Auto-Start | yes |

MVP Features:
1. User auth
2. Job CRUD
3. Basic invoicing
4. Customer list
5. Mobile-responsive

Ready to proceed? Type "go" to start.
```

Type **"go"** and press Enter.

### Step 4: Watch the Build

Claude will:
1. Generate full PRD (20+ user stories)
2. Convert to Ralph format
3. Create project with shadcn
4. Set up Ralph scripts
5. Start autonomous loop

You'll see:
```
🤖 RALPH AUTONOMOUS BUILD
═══════════════════════════════════════════
Project:    tradesperson-crm
Iterations: 25 max
Stories:    24 total
Remaining:  24
═══════════════════════════════════════════

───────────────────────────────────────────
  Iteration 1/25 | Remaining: 24 stories
───────────────────────────────────────────
```

Each iteration:
1. Reads `prd.json`
2. Finds first incomplete story
3. Implements it
4. Runs checks
5. Commits if passing
6. Updates `prd.json`

### Step 5: Monitor Progress

**In another terminal:**

```bash
cd tradesperson-crm

# Watch story completion
watch -n 5 'cat scripts/ralph/prd.json | jq ".userStories[] | {id,title,passes}"'

# Follow progress log
tail -f scripts/ralph/progress.txt

# Check git log
git log --oneline -10
```

### Step 6: Completion

When all stories pass:

```
═══════════════════════════════════════════
🎉 ALL STORIES COMPLETE!
═══════════════════════════════════════════

Completed in 22 iterations

Next steps:
  1. Review: /review
  2. Test thoroughly
  3. Generate docs: /project-complete
  4. Deploy: /deploy-check
```

### Step 7: Post-Build

```bash
# Review the code
/review

# Generate marketing docs
/project-complete

# Pre-deploy check
/deploy-check

# Deploy
vercel deploy --prod
```

---

## Understanding prd.json

The `scripts/ralph/prd.json` structure:

```json
{
  "projectName": "tradesperson-crm",
  "description": "Mobile CRM for UK tradespeople",
  "userStories": [
    {
      "id": "US-001",
      "title": "Database schema setup",
      "priority": 1,
      "category": "database",
      "description": "Create Prisma schema with User, Job, Customer, Invoice models",
      "acceptanceCriteria": [
        "Schema file exists at prisma/schema.prisma",
        "All 4 models defined with proper relations",
        "npm run db:push succeeds",
        "npm run typecheck passes"
      ],
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-002",
      "title": "User authentication setup",
      "priority": 2,
      "category": "backend",
      "description": "Configure Better Auth with email/password",
      "acceptanceCriteria": [
        "Auth configured in src/lib/auth.ts",
        "Sign up endpoint works",
        "Sign in endpoint works",
        "Session management functional",
        "npm run typecheck passes"
      ],
      "passes": false,
      "notes": ""
    }
  ]
}
```

**Key fields:**
- `priority` — Order of implementation (1 first)
- `category` — database, backend, frontend, integration
- `passes` — Set to true when story complete
- `notes` — Ralph adds learnings here

---

## Handling Issues

### Story Fails

If a story fails checks, Ralph will:
1. Add notes to the story's `notes` field
2. Continue to next iteration
3. Retry the story later

### Max Iterations Reached

If you hit max iterations with stories remaining:

```bash
# Run more iterations
./scripts/ralph/ralph.sh 20

# Or complete manually
/implement "remaining feature"
```

### Stuck Story

If a story keeps failing:
1. Check `scripts/ralph/progress.txt` for errors
2. Fix manually
3. Update `prd.json`: set `passes: true`
4. Run Ralph again

### Manual Override

Edit `prd.json` directly:
```bash
# Mark story as complete
cat scripts/ralph/prd.json | jq '.userStories[2].passes = true' > tmp.json && mv tmp.json scripts/ralph/prd.json
```

---

## Tips for Success

### 1. Keep Stories Small
Each story should be completable in ~30 minutes. If larger, break it down.

### 2. Order Matters
Stories are executed by priority. Ensure dependencies are ordered correctly:
1. Database/schema
2. Backend/API
3. Frontend/UI
4. Integration/polish

### 3. Clear Acceptance Criteria
Each criterion should be checkable:
- ✅ "npm run typecheck passes"
- ✅ "Login form submits and redirects to dashboard"
- ❌ "Code is clean" (vague)

### 4. Include Quality Checks
Every story should include:
- `npm run typecheck passes`
- For frontend: "Verify in browser using dev-browser skill"

### 5. Monitor Early
Watch the first few iterations to ensure Ralph understands the project.

### 6. Commit Frequently
Ralph commits after each successful story. If it fails mid-way, you don't lose progress.

---

## Ralph Files Reference

```
scripts/ralph/
├── prd.json       # User stories (modified by Ralph)
├── ralph.sh       # Main loop script
├── prompt.md      # Instructions for each iteration
└── progress.txt   # Learning log
```

### ralph.sh
```bash
#!/bin/bash
MAX_ITERATIONS=${1:-25}
# ... runs claude -p with prompt.md
```

### prompt.md
Instructions for each iteration:
1. Read prd.json
2. Find highest priority incomplete story
3. Implement ONE story only
4. Run checks
5. Commit if passing
6. Update prd.json

### progress.txt
Cumulative log of discoveries:
```
## Learnings
- Prisma needs --force after enum changes
- shadcn button needs 'use client'

## Issues & Solutions
- Auth session not persisting → Added secure cookie config
```

---

## Example: Full Build Output

```
🚀 Full Build Complete!

Project: tradesperson-crm

scripts/ralph/
├── prd.json             # 24 user stories
├── ralph.sh             # Autonomous loop
├── prompt.md            # Iteration instructions
└── progress.txt         # Learning log

Summary:
| Metric | Value |
|--------|-------|
| User Stories | 24 |
| Estimated Time | 25 iterations × ~2 min = ~50 min |
| Backend Stories | 8 |
| Frontend Stories | 14 |
| Integration | 2 |

🤖 Starting Ralph...
```

---

## Troubleshooting

### "origin/HEAD not found"
```bash
git remote set-head origin -a
```

### Permissions on ralph.sh
```bash
chmod +x scripts/ralph/ralph.sh
```

### Claude CLI not found
```bash
npm install -g @anthropic-ai/claude-code
```

### Stories completing too fast (skipping work)
Check if stories are already implemented from a previous run. Reset:
```bash
cat scripts/ralph/prd.json | jq '.userStories[].passes = false' > tmp.json && mv tmp.json scripts/ralph/prd.json
```

---

## Summary

1. `/full-build` → Answer 8 questions → "go"
2. Watch Ralph build autonomously
3. `/review` → `/project-complete` → `/deploy-check`
4. Ship it 🚀
