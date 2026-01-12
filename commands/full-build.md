---
description: Full workflow from idea to autonomous execution (PRD → Ralph → Build)
allowed-tools: Read, Write, Edit, Bash(*), Glob, Grep, WebSearch
model: opus
argument-hint: [product-description]
---

# Full Build Workflow

Complete workflow from product idea to autonomous implementation.

## Phase 1: Interview (Sequential Questions)

**IMPORTANT**: Ask ONE question at a time using the AskUserQuestion tool. Wait for each response before asking the next question.

### Question Flow

**Question 1: Product Type**
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "What are you building? Describe the core functionality and value proposition.",
    "header": "Product",
    "options": [
      {"label": "SaaS Application", "description": "Web-based software service"},
      {"label": "Mobile App", "description": "iOS/Android app with React Native + Expo"},
      {"label": "Internal Tool", "description": "Business/team internal application"},
      {"label": "Marketplace/Platform", "description": "Multi-sided platform connecting users"}
    ],
    "multiSelect": false
  }]
}
```
*User selects type, then describes their specific product via "Other" or follow-up.*

**Question 2: Target Audience**
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Who will use this? What's their technical sophistication?",
    "header": "Audience",
    "options": [
      {"label": "Consumers", "description": "General public, non-technical users"},
      {"label": "Business Users", "description": "Professionals, moderate tech comfort"},
      {"label": "Developers", "description": "Technical users, high sophistication"},
      {"label": "Enterprise", "description": "Corporate teams, mixed technical levels"}
    ],
    "multiSelect": false
  }]
}
```

**Question 3: MVP Features**
*This is a free-text question - user describes their features via "Other".*
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "What 3-5 features MUST be in v1? Everything else is v2. Be ruthless.",
    "header": "MVP",
    "options": [
      {"label": "Auth + CRUD", "description": "User auth, create/read/update/delete core entity"},
      {"label": "Dashboard + Analytics", "description": "Overview dashboard with key metrics"},
      {"label": "Payments", "description": "Stripe integration for subscriptions/purchases"}
    ],
    "multiSelect": true
  }]
}
```
*User can select common features AND/OR describe custom ones via "Other".*

**Question 4: Tech Stack**
Use AskUserQuestion tool:

*If user selected "Mobile App" in Question 1:*
```json
{
  "questions": [{
    "question": "Which tech stack would you like to use?",
    "header": "Stack",
    "options": [
      {"label": "Expo + Supabase (Recommended)", "description": "React Native, Expo, TypeScript, NativeWind, Supabase, Expo Router"},
      {"label": "Expo + Firebase", "description": "React Native, Expo, TypeScript, NativeWind, Firebase"},
      {"label": "Bare React Native", "description": "React Native CLI, no Expo"}
    ],
    "multiSelect": false
  }]
}
```

*Otherwise (web app):*
```json
{
  "questions": [{
    "question": "Which tech stack would you like to use?",
    "header": "Stack",
    "options": [
      {"label": "Next.js + Supabase (Recommended)", "description": "Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, Supabase, Better Auth"},
      {"label": "Next.js + Prisma", "description": "Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL"},
      {"label": "Vite + Express", "description": "Vite, React 19, TypeScript, Tailwind, Express backend"}
    ],
    "multiSelect": false
  }]
}
```
*User can select "Other" to specify a custom stack.*

**Question 5: UI Library**

*Skip this question if user selected "Mobile App" - mobile uses NativeWind defaults.*

*For web apps only:*
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Which UI component library would you like?",
    "header": "UI",
    "options": [
      {"label": "shadcn/ui (Recommended)", "description": "Copy-paste components, full control, Tailwind-based"},
      {"label": "Radix + Tailwind", "description": "Radix primitives with custom Tailwind styling"},
      {"label": "Headless UI", "description": "Unstyled accessible components from Tailwind Labs"},
      {"label": "Tailwind only", "description": "No component library, just Tailwind CSS"}
    ],
    "multiSelect": false
  }]
}
```

*If user selected "shadcn/ui", ask follow-up for style:*
```json
{
  "questions": [{
    "question": "Which shadcn/ui visual style?",
    "header": "Style",
    "options": [
      {"label": "lyra (Recommended)", "description": "Boxy, sharp edges - modern look"},
      {"label": "vega", "description": "Classic shadcn look"},
      {"label": "nova", "description": "Compact padding"},
      {"label": "maia", "description": "Soft, rounded corners"}
    ],
    "multiSelect": false
  }]
}
```
*User can select "Other" to paste a custom preset URL.*

**Question 6: Project Name**
*Generate 2-3 suggested names based on the product description, then let user pick or type their own.*
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "What should the project folder be called? (use-kebab-case)",
    "header": "Name",
    "options": [
      {"label": "[generated-name-1]", "description": "Based on your product description"},
      {"label": "[generated-name-2]", "description": "Alternative suggestion"}
    ],
    "multiSelect": false
  }]
}
```
*Replace [generated-name-X] with actual suggestions based on the product. User can select "Other" to type custom name.*

**Question 7: Auto-Start Build**
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Start the Ralph autonomous build immediately after setup?",
    "header": "Auto-start",
    "options": [
      {"label": "Yes, auto iterations (Recommended)", "description": "Start now with stories × 1.5 iterations"},
      {"label": "Yes, 25 iterations", "description": "Start now with fixed 25 iteration limit"},
      {"label": "Yes, 50 iterations", "description": "Start now with fixed 50 iteration limit"},
      {"label": "No, setup only", "description": "Just set up everything, I'll start manually"}
    ],
    "multiSelect": false
  }]
}
```
*User can select "Other" to specify a custom iteration count.*

### After All Questions

Once all 7 questions are answered, parse into configuration:

```yaml
config:
  product_description: "[answer 1]"
  target_audience: "[answer 2]"
  mvp_features:
    - "[feature 1]"
    - "[feature 2]"
    - "[feature 3]"
  tech_stack:
    frontend: "Next.js 15, React 19, TypeScript, Tailwind"
    ui: "shadcn/ui"
    backend: "Server Actions + API routes"
    database: "Supabase (PostgreSQL)"
    auth: "Better Auth"
    hosting: "Vercel"
  shadcn_preset: "[style name → convert to URL]"
  project_name: "[answer 6]"
  ralph_iterations: "auto"  # Calculate as story_count × 1.5
  auto_start: "[answer 7: yes/no]"
```

### shadcn Preset URL Mapping

If user provides style name instead of URL, map to:
- **vega**: `https://ui.shadcn.com/init?base=radix&style=vega&baseColor=neutral&theme=neutral&iconLibrary=lucide&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=next`
- **nova**: `https://ui.shadcn.com/init?base=radix&style=nova&baseColor=neutral&theme=neutral&iconLibrary=lucide&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=next`
- **maia**: `https://ui.shadcn.com/init?base=radix&style=maia&baseColor=neutral&theme=neutral&iconLibrary=lucide&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=next`
- **lyra** (default): `https://ui.shadcn.com/init?base=radix&style=lyra&baseColor=neutral&theme=neutral&iconLibrary=lucide&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=next`
- **mira**: `https://ui.shadcn.com/init?base=radix&style=mira&baseColor=neutral&theme=neutral&iconLibrary=lucide&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=next`

---

## Phase 2: Confirm Before Starting

Show summary and get explicit confirmation:

```markdown
## ✅ Confirm Project Setup

| Setting | Value |
|---------|-------|
| **Project** | [project_name] |
| **Description** | [1 sentence summary] |
| **Audience** | [target_audience] |
| **Style** | [shadcn style] |
| **Auto-Start** | [yes/no] |

### MVP Features
1. [feature 1]
2. [feature 2]
3. [feature 3]

### Tech Stack
- Frontend: Next.js 15, React 19, TypeScript, Tailwind
- UI: shadcn/ui ([style])
- Backend: Server Actions + API routes
- Database: Supabase (PostgreSQL)
- Auth: Better Auth
- Hosting: Vercel

---

**Ready to proceed?** This will:
1. Generate a full PRD with 20+ user stories
2. Convert to Ralph format for autonomous execution
3. Scaffold the Next.js project with shadcn
4. Set up Ralph scripts (iterations auto-calculated)
[5. Start autonomous build] ← if auto_start: yes

Type **"go"** to start, or tell me what to change.
```

**Wait for "go"** (or similar confirmation) before continuing.

---

## Phase 3: Generate PRD

Follow the **prd skill** methodology:

```markdown
### 📝 Generating PRD...
```

1. Create directory: `mkdir -p docs/prd`
2. Generate `docs/prd/[project-name]-prd.md`
3. Include ALL 15 sections from PRD skill
4. Write **20+ user stories** in Gherkin format
5. Base stories on the MVP features provided
6. Full API specs and data model

**Progress Update**:
```markdown
✅ **PRD Complete**: `docs/prd/[name]-prd.md`

| Section | Status |
|---------|--------|
| Product Overview | ✅ |
| User Stories | ✅ [N] stories (Gherkin) |
| User Flows | ✅ |
| Screens/UI | ✅ |
| Features | ✅ |
| Architecture | ✅ |
| System Design | ✅ |
| API Specs | ✅ [N] endpoints |
| Data Model | ✅ [N] entities |
| Security | ✅ |
| Performance | ✅ |
| Scalability | ✅ |
| Testing | ✅ |
| Deployment | ✅ |
| Maintenance | ✅ |

Proceeding to Ralph conversion...
```

---

## Phase 4: Convert to Ralph Format

Follow the **ralph skill** methodology:

```markdown
### 🔄 Converting to Ralph format...
```

1. Analyze PRD for all implementation steps
2. Break into atomic user stories
3. **Size check**: Each story must be completable in ONE context window
4. Order by dependencies: Schema → API → UI → Integration
5. Write checkable acceptance criteria
6. Add quality checks to each story

**Acceptance Criteria Rules**:
- Every story includes `npm run typecheck passes`
- Frontend stories include `Verify in browser using dev-browser skill`
- Specific, checkable criteria (not vague)

**If ralph_iterations was "auto"**: Calculate based on story count × 1.5

**Progress Update**:
```markdown
✅ **Ralph Conversion Complete**

| Category | Stories |
|----------|---------|
| Database/Schema | [N] |
| Backend/API | [N] |
| Frontend/UI | [N] |
| Integration/Polish | [N] |
| **Total** | **[N]** |

**Recommended iterations**: [calculated] (stories × 1.5 for retries)
**Configured iterations**: [ralph_iterations]

Proceeding to project setup...
```

---

## Phase 5: Project Setup

### Create Project

```bash
# Create Next.js project with shadcn
npx shadcn@latest create --preset "[shadcn_preset]" --template next [project_name]

cd [project_name]
```

### Create Directory Structure

```bash
mkdir -p scripts/ralph
mkdir -p docs/prd
mkdir -p docs/public
```

### Move PRD

Copy the generated PRD into the project's docs folder.

### Create scripts/ralph/prd.json

The converted Ralph format from Phase 4.

### Create scripts/ralph/ralph.sh

```bash
#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# Ralph Autonomous Build Loop
# Project: [project_name]
# Generated: [date]
# ═══════════════════════════════════════════════════════════════════

set -e

MAX_ITERATIONS=${1:-[ralph_iterations]}
ITERATION=0

echo ""
echo "🤖 RALPH AUTONOMOUS BUILD"
echo "═══════════════════════════════════════════════════════════════════"
echo "Project:    [project_name]"
echo "Iterations: $MAX_ITERATIONS max"
echo "Stories:    $(cat scripts/ralph/prd.json | jq '.userStories | length') total"
echo "Remaining:  $(cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length')"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))
    
    # Check completion
    REMAINING=$(cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length')
    
    if [ "$REMAINING" = "0" ]; then
        echo ""
        echo "═══════════════════════════════════════════════════════════════════"
        echo "🎉 ALL STORIES COMPLETE!"
        echo "═══════════════════════════════════════════════════════════════════"
        echo ""
        echo "Completed in $((ITERATION - 1)) iterations"
        echo ""
        echo "Next steps:"
        echo "  1. Review: /review"
        echo "  2. Test thoroughly"
        echo "  3. Generate docs: /project-complete"
        echo "  4. Deploy: /deploy-check"
        echo ""
        exit 0
    fi
    
    echo "───────────────────────────────────────────────────────────────────"
    echo "  Iteration $ITERATION/$MAX_ITERATIONS | Remaining: $REMAINING stories"
    echo "───────────────────────────────────────────────────────────────────"
    
    # Run Claude with iteration prompt
    claude -p "$(cat scripts/ralph/prompt.md)"
    
    sleep 2
done

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "⚠️  MAX ITERATIONS REACHED ($MAX_ITERATIONS)"
echo "═══════════════════════════════════════════════════════════════════"
REMAINING=$(cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length')
echo "Remaining stories: $REMAINING"
echo ""
echo "Options:"
echo "  ./scripts/ralph/ralph.sh 20    # Run 20 more iterations"
echo "  /implement [feature]           # Complete manually"
echo ""
```

### Create scripts/ralph/prompt.md

```markdown
# Ralph Iteration

You are in a Ralph autonomous loop for **[project_name]**.

## Your Job (ONE story only)

1. Read `scripts/ralph/prd.json`
2. Find the **highest priority** story where `passes: false`
3. Implement **ONLY** that one story
4. Run checks:
   ```bash
   npm run typecheck
   npm run lint
   npm run test  # if tests exist for this feature
   ```
5. For frontend stories: `Verify in browser using dev-browser skill`
6. If ALL checks pass:
   ```bash
   git add .
   git commit -m "feat([scope]): [what you did]"
   ```
   Then update `scripts/ralph/prd.json`: set that story's `passes: true`
7. Add learnings to `scripts/ralph/progress.txt`

## Rules
- **ONE** story per iteration
- Commit after completing each story
- If stuck >5 min, add notes to story's `notes` field and continue
- Never modify stories that already have `passes: true`

## Quick Reference
```bash
# Check status
cat scripts/ralph/prd.json | jq '.userStories[] | {id, title, passes}'

# See what's left
cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)][0]'

# Check progress notes
cat scripts/ralph/progress.txt
```

## Project Context
Read `CLAUDE.md` for conventions and gotchas.
```

### Create scripts/ralph/progress.txt

```
# ═══════════════════════════════════════════════════════════════════
# Ralph Progress Log: [project_name]
# Started: [timestamp]
# ═══════════════════════════════════════════════════════════════════

## Learnings
(Ralph appends discoveries here)

## Issues & Solutions
(Track problems encountered and how they were solved)

## Notes
(Anything useful for future iterations)
```

### Create CLAUDE.md

```markdown
# [project_name]

## Overview
[product_description]

**Target Audience**: [target_audience]

## MVP Features
- [feature 1]
- [feature 2]
- [feature 3]

## Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind
- **UI**: shadcn/ui ([style])
- **Backend**: [backend]
- **Database**: [database]
- **Auth**: [auth]

## Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Lint code
npm run typecheck    # Type check
```

## Ralph
```bash
./scripts/ralph/ralph.sh        # Run autonomous loop
./scripts/ralph/ralph.sh 50     # Custom iteration count
```

Check status:
```bash
cat scripts/ralph/prd.json | jq '.userStories[] | {id, title, passes}'
```

## Conventions
- Conventional commits: `feat:`, `fix:`, `chore:`
- Components: `src/components/`
- API routes: `src/app/api/`
- Server actions: colocate with pages

## Gotchas
[Add discoveries during development]
```

### Make Scripts Executable

```bash
chmod +x scripts/ralph/ralph.sh
```

### Initialize Git

```bash
git init
git add .
git commit -m "chore: initial project setup via /full-build"
```

---

## Phase 6: Final Output

```markdown
## 🚀 Full Build Complete!

### Project: [project_name]

```
[project_name]/
├── docs/
│   └── prd/
│       └── [name]-prd.md        # Full PRD
├── scripts/
│   └── ralph/
│       ├── prd.json             # [N] user stories
│       ├── ralph.sh             # Autonomous loop
│       ├── prompt.md            # Iteration instructions
│       └── progress.txt         # Learning log
├── CLAUDE.md                    # Project context
├── src/                         # Next.js app
└── [shadcn components]
```

### Summary

| Metric | Value |
|--------|-------|
| User Stories | [N] |
| Estimated Time | [N] iterations × ~2 min = ~[N] min |
| Backend Stories | [N] |
| Frontend Stories | [N] |

### [If auto_start is true]

---

## 🤖 Starting Ralph...

**Note**: Environment variables (.env.local) are NOT required to start Ralph. Ralph generates code and can build the entire codebase without database/auth credentials. You'll only need env vars when you want to actually run and test the app.

```bash
cd [project_name]
./scripts/ralph/ralph.sh
```

**Start Ralph now, or configure env vars first?**

Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Ralph can build without env vars. Configure them now or start building?",
    "header": "Start",
    "options": [
      {"label": "Start Ralph now (Recommended)", "description": "Build first, configure env vars later when testing"},
      {"label": "Set up Supabase first", "description": "I'll guide you through creating a project and getting keys"},
      {"label": "I'll configure manually", "description": "Skip - I'll set up env vars and run ralph.sh myself"}
    ],
    "multiSelect": false
  }]
}
```

If user selects "Start Ralph now", immediately run:
```bash
./scripts/ralph/ralph.sh [iterations]
```

Watch the progress below. I'll notify you when complete!

### [If auto_start is false]

---

## Ready to Build!

```bash
# 1. Navigate to project
cd [project_name]

# 2. Start dev server (in one terminal)
npm run dev

# 3. Start Ralph (in another terminal)
./scripts/ralph/ralph.sh
```

### Monitor Progress

```bash
# Watch stories complete
watch -n 5 'cat scripts/ralph/prd.json | jq ".userStories[] | {id,title,passes}"'

# Follow progress log
tail -f scripts/ralph/progress.txt
```

### After Completion

```bash
/project-complete    # Generate marketing docs
/review              # Final code review
/deploy-check        # Pre-deployment checks
```
```
