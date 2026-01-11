# Ralph - Autonomous Agent Loop

## Purpose
Convert PRDs to `prd.json` format for autonomous execution. Ralph runs Claude Code repeatedly until all user stories are complete, with each iteration being a fresh context window.

## When to Invoke
- "Convert this PRD to Ralph format"
- "Create prd.json from this"
- "Turn this into autonomous tasks"
- "Set up Ralph for this feature"
- After completing a PRD, ready for implementation

---

## How Ralph Works

```
┌─────────────────────────────────────────────────────────────┐
│                     RALPH LOOP                               │
├─────────────────────────────────────────────────────────────┤
│  1. Create feature branch                                    │
│  2. Pick highest priority story where passes: false          │
│  3. Implement that ONE story                                 │
│  4. Run quality checks (typecheck, tests)                    │
│  5. Commit if checks pass                                    │
│  6. Update prd.json: story.passes = true                     │
│  7. Append learnings to progress.txt                         │
│  8. Repeat until all stories pass or max iterations          │
└─────────────────────────────────────────────────────────────┘
```

**Key Principle**: Each iteration spawns a fresh Claude Code instance with NO memory of previous work. The only persistence is:
- Git history (commits)
- `prd.json` (task status)
- `progress.txt` (learnings)
- CLAUDE.md / AGENTS.md (conventions)

---

## prd.json Format

```json
{
  "project": "ProjectName",
  "branchName": "ralph/feature-name-kebab-case",
  "description": "Feature description from PRD title/intro",
  "userStories": [
    {
      "id": "US-001",
      "title": "Short descriptive title",
      "description": "As a [user], I want [feature] so that [benefit]",
      "acceptanceCriteria": [
        "Specific, verifiable criterion 1",
        "Specific, verifiable criterion 2",
        "npm run typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

---

## Story Requirements

### Size Constraint (CRITICAL)
Each story MUST be completable in ONE iteration (~one context window).

**Rule of thumb**: If you can't describe the change in 2-3 sentences, it's too big.

❌ **Too Big**:
```json
{
  "title": "Implement user authentication system",
  "description": "Build complete auth with login, register, forgot password, OAuth"
}
```

✅ **Right Size**:
```json
{
  "title": "Add password hash column to users table",
  "acceptanceCriteria": [
    "Add password_hash column (text, not null)",
    "Migration runs successfully",
    "npm run typecheck passes"
  ]
}
```

### Breaking Down Large Features

```markdown
## Original: "User Authentication"

Split into:
1. Add user table with email/password_hash columns
2. Create register API endpoint with validation
3. Create login API endpoint returning JWT
4. Add auth middleware for protected routes
5. Build registration form UI
6. Build login form UI
7. Add logout functionality
8. Wire up protected route redirects
```

### Acceptance Criteria Rules

Each criterion must be **CHECKABLE**, not vague:

❌ **Vague**:
- "Works correctly"
- "Looks good"
- "Handles errors properly"

✅ **Checkable**:
- "Returns 400 with message 'Email required' when email missing"
- "Button disabled while form submits"
- "Console shows no TypeScript errors"
- "Verify in browser using dev-browser skill" (for frontend stories)

### Required Criteria
Every story should include at least one of:
- `npm run typecheck passes`
- `npm run test passes`
- `npm run lint passes`
- `Verify in browser using dev-browser skill` (frontend)

---

## Priority & Dependencies

```json
{
  "userStories": [
    { "id": "US-001", "priority": 1, "title": "Database schema" },
    { "id": "US-002", "priority": 2, "title": "API endpoint" },
    { "id": "US-003", "priority": 3, "title": "UI component" }
  ]
}
```

- Stories execute in priority order (1 first)
- **Earlier stories must NOT depend on later ones**
- Database/backend stories before frontend stories
- Schema changes before API changes

---

## Conversion Process

### Step 1: Analyze the PRD
Identify:
- Core feature being built
- Appropriate branch name
- All implementation steps needed

### Step 2: Break Into Stories
For each PRD section/feature:
1. What database changes needed?
2. What API endpoints needed?
3. What UI components needed?
4. What wiring/integration needed?

### Step 3: Order by Dependencies
```
Schema → API → UI → Integration → Polish
```

### Step 4: Write Acceptance Criteria
For each story, ask:
- How will Ralph know this is DONE?
- What specific check proves it works?
- What command verifies success?

### Step 5: Validate Size
For each story, ask:
- Can I describe the change in 2-3 sentences?
- Can this be done in ~30 minutes of focused work?
- Is there ONE clear deliverable?

---

## Example Conversion

### PRD Input
```markdown
# Friends Outreach Feature
Add ability to mark investors as "friends" for warm outreach.

## Requirements
- Toggle between cold/friend on investor list
- Friends get shorter follow-up sequence (3 instead of 5)
- Different message template for friends
- Filter list by type
```

### prd.json Output
```json
{
  "project": "Untangle",
  "branchName": "ralph/friends-outreach",
  "description": "Friends Outreach - Warm outreach for deck feedback",
  "userStories": [
    {
      "id": "US-001",
      "title": "Add investorType field to investor table",
      "description": "As a developer, I need to categorize investors as 'cold' or 'friend'.",
      "acceptanceCriteria": [
        "Add investorType column: 'cold' | 'friend' (default 'cold')",
        "Generate and run migration successfully",
        "npm run typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-002",
      "title": "Add type toggle to investor list rows",
      "description": "As a user, I want to toggle investor type directly from the list.",
      "acceptanceCriteria": [
        "Each row has Cold | Friend toggle button",
        "Clicking toggle updates database",
        "npm run typecheck passes",
        "Verify in browser using dev-browser skill"
      ],
      "priority": 2,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-003",
      "title": "Add investor type filter to list",
      "description": "As a user, I want to filter the list by investor type.",
      "acceptanceCriteria": [
        "Filter dropdown with options: All, Cold, Friends",
        "Selecting filter updates list immediately",
        "npm run typecheck passes",
        "Verify in browser using dev-browser skill"
      ],
      "priority": 3,
      "passes": false,
      "notes": ""
    },
    {
      "id": "US-004",
      "title": "Update sequence length based on type",
      "description": "As the system, I generate 3-step sequences for friends, 5 for cold.",
      "acceptanceCriteria": [
        "Friend investors get 3 follow-up steps",
        "Cold investors get 5 follow-up steps",
        "Existing tests pass",
        "npm run typecheck passes"
      ],
      "priority": 4,
      "passes": false,
      "notes": ""
    }
  ]
}
```

---

## Running Ralph

### Setup (One-time)
```bash
# Create Ralph directory in project
mkdir -p scripts/ralph

# Create prd.json (use this skill)
# Place in scripts/ralph/prd.json
```

### Execute
```bash
# Run with default 10 iterations
./scripts/ralph/ralph.sh

# Run with custom max iterations
./scripts/ralph/ralph.sh 25
```

### Monitor Progress
```bash
# See which stories are done
cat scripts/ralph/prd.json | jq '.userStories[] | {id, title, passes}'

# See learnings
cat scripts/ralph/progress.txt

# Check git history
git log --oneline -10
```

---

## Output

After conversion, output:
1. The complete `prd.json` file
2. Summary of stories created
3. Estimated iterations needed
4. Any concerns about story size

```markdown
## Ralph Conversion Complete

**Project**: [Name]
**Branch**: ralph/[feature]
**Stories**: [N] user stories created

### Story Summary
1. [US-001] [Title] - [size estimate]
2. [US-002] [Title] - [size estimate]
...

### Estimated Iterations
Minimum: [N] (one per story)
With retries: [N-N] iterations

### Notes
- [Any concerns about story sizing]
- [Dependencies to be aware of]

Ready to run: `./scripts/ralph/ralph.sh`
```
