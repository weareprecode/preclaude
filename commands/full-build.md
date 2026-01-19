---
description: Full workflow from idea to autonomous execution (PRD → Ralph → Build)
allowed-tools: Read, Write, Edit, Bash(*), Glob, Grep, WebSearch
model: opus
argument-hint: [product-description]
---

# Full Build Workflow

Complete workflow from product idea to autonomous implementation.

## Pre-Flight: Dependency Check

Before starting, verify jq is installed (required for Ralph):

<jq_check>
!`command -v jq >/dev/null 2>&1 && echo "jq installed" || echo "jq NOT installed - run: brew install jq"`
</jq_check>

If jq is not installed, inform the user and ask them to install it before proceeding.

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

**Question 6: Design Reference**
*Ask if user has a design reference to extract design system from.*
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Do you have a design reference? I can extract colours, typography, spacing, and layout from it.",
    "header": "Design",
    "options": [
      {"label": "Website URL", "description": "I'll paste a URL to use as design inspiration"},
      {"label": "Figma link", "description": "I have a Figma file to extract designs from"},
      {"label": "Screenshot", "description": "I'll provide a screenshot to analyse"},
      {"label": "No reference", "description": "Start fresh with default styling"}
    ],
    "multiSelect": false
  }]
}
```

*If user selects URL, Figma, or Screenshot:*
- **URL**: Use WebFetch to analyse the site and extract the full design system (colours, typography, spacing, border-radius, shadows, layout patterns, animations)
- **Figma**: Ask user to paste Figma link, use mcp__figma__get_figma_data to extract design tokens
- **Screenshot**: Ask user to provide screenshot path, analyse it for design system

Store extracted design system in config for later use by ui-designer agent.

**Question 7: Deep Research**
*Ask if user wants competitive analysis before building.*
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Want me to research competitors and market gaps before building?",
    "header": "Research",
    "options": [
      {"label": "Yes, deep research", "description": "Analyse competitors, find gaps, validate idea (adds ~5 min)"},
      {"label": "Quick scan", "description": "Brief look at top 3 competitors"},
      {"label": "Skip research", "description": "I've already done my research"}
    ],
    "multiSelect": false
  }]
}
```

*If user selects "Yes, deep research":*
First, warn the user:
```markdown
⏱️ **Deep research typically takes 5-10 minutes** as I'll be:
- Searching for 10+ competitors
- Analysing features, pricing, and UX patterns
- Reading reviews and user feedback
- Identifying gaps and opportunities

Starting research now...
```

Then:
- Use WebSearch to find competitors in the space
- Analyse their features, pricing, UX patterns
- Read reviews and sentiment
- Identify gaps and opportunities
- Add findings to PRD

**Question 8: Project Name**

<current_folder>
!`basename "$(pwd)"`
</current_folder>

*Generate 2-3 suggested names based on the product description, then let user pick or type their own.*
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "What should the project folder be called? (use-kebab-case)",
    "header": "Name",
    "options": [
      {"label": "Use current folder ([current_folder])", "description": "Build in this directory instead of creating a subfolder"},
      {"label": "[generated-name-1]", "description": "Based on your product description"},
      {"label": "[generated-name-2]", "description": "Alternative suggestion"}
    ],
    "multiSelect": false
  }]
}
```
*Replace [current_folder] with the actual current folder name, and [generated-name-X] with actual suggestions based on the product. User can select "Other" to type custom name.*

**After Question 8: Show Project Location**

<current_dir>
!`pwd`
</current_dir>

If user selected "Use current folder":
```markdown
📁 **Project Location**

Your project will be created in the current directory:
`[current_dir]/`

✅ Using existing folder as project root.
```
*Set `use_current_folder=true` for later steps.*

Otherwise (user selected a generated name or typed custom name):
```markdown
📁 **Project Location**

Your project will be created at:
`[current_dir]/[project_name]/`

⚠️ This creates a NEW subfolder. The current directory will NOT be used directly.
```
*Set `use_current_folder=false` for later steps.*

*Continue to Question 9.*

**Question 9: Auto-Start Build**
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

**Question 10: Ralph Mode** *(Only ask if auto-start is Yes)*
Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Which Ralph mode do you want to use?",
    "header": "Ralph mode",
    "options": [
      {"label": "Same context (Recommended)", "description": "Faster, Claude remembers previous work. Best for <15 stories."},
      {"label": "Fresh context", "description": "Clean slate each story. Best for 20+ stories or overnight builds."}
    ],
    "multiSelect": false
  }]
}
```

**Same context**: Uses Anthropic plugin - all stories in one session, faster, Claude remembers failures.
**Fresh context**: Original Ralph - spawns new Claude per story, clean slate, better for long builds.

### After All Questions

Once all questions are answered, parse into configuration:

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
  design_reference:
    type: "[url/figma/screenshot/none]"
    source: "[URL or path if provided]"
    extracted_system:
      colors: {}
      typography: {}
      spacing: {}
      border_radius: {}
      shadows: {}
  competitive_research: "[deep/quick/skip]"
  project_name: "[answer 8]"
  ralph_iterations: "auto"  # Calculate as story_count × 1.5
  auto_start: "[answer 9: yes/no]"
  ralph_mode: "[answer 10: same-context/fresh-context]"  # Only if auto_start is yes
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

## Phase 4: Convert to prd.json Format

Follow the **prd-json** methodology:

```markdown
### 🔄 Converting PRD to prd.json...
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

**If `use_current_folder=true`:**
```bash
# Initialize in current directory
npx shadcn@latest init --preset "[shadcn_preset]"
```
*Skip the `cd` command - already in the right directory.*

**If `use_current_folder=false`:**
```bash
# Create Next.js project with shadcn in new subfolder
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
BUILD_LOG="scripts/ralph/build-log.json"
TOTAL_STORIES=$(cat scripts/ralph/prd.json | jq '.userStories | length')

# Initialize build log if not exists
if [ ! -f "$BUILD_LOG" ]; then
    echo "{
  \"project\": \"[project_name]\",
  \"startedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"completedAt\": null,
  \"totalStories\": $TOTAL_STORIES,
  \"storiesCompleted\": 0,
  \"iterations\": 0,
  \"stories\": []
}" > "$BUILD_LOG"
fi

echo ""
echo "🤖 RALPH AUTONOMOUS BUILD"
echo "═══════════════════════════════════════════════════════════════════"
echo "Project:    [project_name]"
echo "Iterations: $MAX_ITERATIONS max"
echo "Stories:    $TOTAL_STORIES total"
echo "Remaining:  $(cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length')"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ITERATION=$((ITERATION + 1))

    # Check completion
    REMAINING=$(cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length')

    if [ "$REMAINING" = "0" ]; then
        # Update build log completion
        jq --arg time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
           --arg iterations "$ITERATION" \
           '.completedAt = $time | .iterations = ($iterations | tonumber)' \
           "$BUILD_LOG" > tmp.json && mv tmp.json "$BUILD_LOG"

        COMPLETED=$(jq '[.stories[] | select(.status == "completed")] | length' "$BUILD_LOG")
        FIRST_TRY=$(jq '[.stories[] | select(.attempts == 1)] | length' "$BUILD_LOG" 2>/dev/null || echo "0")

        echo ""
        echo "═══════════════════════════════════════════════════════════════════"
        echo "🎉 ALL STORIES COMPLETE!"
        echo "───────────────────────────────────────────────────────────────────"
        echo "  Stories:     $COMPLETED/$TOTAL_STORIES"
        echo "  Iterations:  $ITERATION"
        if [ "$COMPLETED" -gt 0 ] && [ "$FIRST_TRY" != "0" ]; then
            echo "  First-try:   $FIRST_TRY stories ($(( FIRST_TRY * 100 / COMPLETED ))%)"
        fi
        echo "═══════════════════════════════════════════════════════════════════"
        echo ""
        echo "Build log: scripts/ralph/build-log.json"
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

    # Update iteration count in build log
    jq --arg iterations "$ITERATION" '.iterations = ($iterations | tonumber)' \
       "$BUILD_LOG" > tmp.json && mv tmp.json "$BUILD_LOG"

    sleep 2
done

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "⚠️  MAX ITERATIONS REACHED ($MAX_ITERATIONS)"
echo "═══════════════════════════════════════════════════════════════════"
REMAINING=$(cat scripts/ralph/prd.json | jq '[.userStories[] | select(.passes == false)] | length')
echo "Remaining stories: $REMAINING"
echo "Check build-log.json for story breakdown"
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
3. Check `scripts/ralph/build-log.json` for this story's attempt count
4. Implement **ONLY** that one story
5. Run checks:
   ```bash
   npm run typecheck
   npm run lint
   npm run test  # if tests exist for this feature
   ```
6. For frontend stories: `Verify in browser using dev-browser skill`
7. If ALL checks pass:
   ```bash
   git add .
   git commit -m "feat([scope]): [what you did]"
   ```
   Then:
   - Update `scripts/ralph/prd.json`: set that story's `passes: true`
   - Update `scripts/ralph/build-log.json`: add story entry with attempts and status
8. If checks FAIL:
   - Update `scripts/ralph/build-log.json`: increment attempts for this story
   - Fix the issues and retry
9. Add learnings to `scripts/ralph/progress.txt`

## Build Log Updates

When completing a story, add/update in build-log.json stories array:
```json
{
  "id": "story-id",
  "title": "Story title",
  "attempts": 1,
  "status": "completed",
  "completedAt": "ISO timestamp"
}
```

When a story fails checks, increment its attempts count before retrying.

## Rules
- **ONE** story per iteration
- Commit after completing each story
- Track attempts in build-log.json
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

# Check build stats
cat scripts/ralph/build-log.json | jq '{iterations, stories: [.stories[] | {title, attempts}]}'
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

## 🤖 Starting Ralph Wiggum...

**Note**: Environment variables (.env.local) are NOT required to start Ralph. Ralph generates code and can build the entire codebase without database/auth credentials. You'll only need env vars when you want to actually run and test the app.

**Start Ralph now, or configure env vars first?**

Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "Ralph can build without env vars. Configure them now or start building?",
    "header": "Start",
    "options": [
      {"label": "Start Ralph Wiggum (Recommended)", "description": "Autonomous loop - builds until all stories complete"},
      {"label": "Set up Supabase first", "description": "I'll guide you through creating a project and getting keys"},
      {"label": "I'll start manually", "description": "Skip - I'll run /build myself"}
    ],
    "multiSelect": false
  }]
}
```

**If user selects "Start Ralph Wiggum"**:

Calculate iterations: `story_count × 1.5` (minimum 10)

**If ralph_mode is "same-context"** (Anthropic plugin):

Invoke `/build`:
```bash
/build [iterations] scripts/ralph/prd.json
```
This uses the Ralph Wiggum plugin's stop hook - loop continues until all stories pass.

**If ralph_mode is "fresh-context"** (Original Ralph):

Generate and run `scripts/ralph/ralph-loop.sh`:
```bash
# Generate the fresh context loop script
mkdir -p scripts/ralph
cat > scripts/ralph/ralph-loop.sh << 'SCRIPT'
#!/bin/bash
PRD_PATH="${1:-scripts/ralph/prd.json}"
MAX_ITERATIONS="${2:-50}"
LOG_FILE="scripts/ralph/ralph.log"
: > "$LOG_FILE"

echo "🔄 Ralph (fresh context) started" | tee -a "$LOG_FILE"

for ((i=1; i<=MAX_ITERATIONS; i++)); do
    REMAINING=$(jq '[.userStories[] | select(.passes == false)] | length' "$PRD_PATH" 2>/dev/null || echo "?")
    [[ "$REMAINING" == "0" ]] && echo "✅ ALL STORIES COMPLETE!" | tee -a "$LOG_FILE" && exit 0

    NEXT=$(jq -r '[.userStories[] | select(.passes == false)][0].title // "?"' "$PRD_PATH" 2>/dev/null)
    echo "🔄 Iteration $i - $NEXT ($REMAINING remaining)" | tee -a "$LOG_FILE"

    claude --print "Read scripts/ralph/prd.json. Implement NEXT story where passes:false. ONE story only. Run typecheck/lint/test. If pass: commit, set passes:true. NEVER ask confirmation." 2>&1 | tee -a "$LOG_FILE"
done

echo "⚠️ Max iterations reached" | tee -a "$LOG_FILE"
SCRIPT
chmod +x scripts/ralph/ralph-loop.sh

# Run in background
nohup scripts/ralph/ralph-loop.sh scripts/ralph/prd.json [iterations] > /dev/null 2>&1 &
echo "Ralph PID: $!"
```

Monitor with: `tail -f scripts/ralph/ralph.log`

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
