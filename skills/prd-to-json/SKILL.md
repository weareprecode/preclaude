# PRD to JSON Converter

## Purpose
Transform Product Requirements Documents into structured JSON format for integration with project management tools, task tracking systems, or development workflows.

## When to Invoke
- Processing PRDs, requirements docs, feature specifications
- Creating development task lists from requirements
- Importing requirements into project management tools
- Generating structured data for sprint planning

---

## Instructions

### Step 1: Identify Document Sections
Scan the PRD for standard sections:
- Overview / Executive Summary
- Goals / Objectives
- User Stories / Use Cases
- Functional Requirements
- Non-Functional Requirements
- Acceptance Criteria
- Technical Constraints
- Dependencies
- Timeline / Milestones

### Step 2: Extract and Categorize

#### Objectives
- Identify high-level goals
- Map to measurable success metrics
- Assign priority (high/medium/low)

#### Requirements
- Separate functional from non-functional
- Assign unique IDs (FR-001, NFR-001)
- Identify dependencies between requirements

#### User Stories
- Parse into standard format: As a [role], I want [goal], so that [benefit]
- Extract acceptance criteria for each story
- Identify story dependencies

#### Tasks
- Break requirements into implementable tasks
- Estimate complexity where possible
- Map tasks to user stories

### Step 3: Validate Structure
- All IDs unique within category
- Priority values: high | medium | low
- Every user story has ≥1 acceptance criterion
- Dependencies reference valid IDs
- No orphaned tasks (all linked to stories)

---

## Output Schema

```json
{
  "document_meta": {
    "title": "string",
    "version": "string",
    "date": "ISO-8601 date",
    "author": "string",
    "status": "draft | review | approved"
  },
  
  "overview": {
    "summary": "string (2-3 sentences)",
    "problem_statement": "string",
    "proposed_solution": "string",
    "target_users": ["string"]
  },
  
  "objectives": [
    {
      "id": "OBJ-001",
      "description": "string",
      "priority": "high | medium | low",
      "success_metrics": [
        {
          "metric": "string",
          "target": "string",
          "measurement": "string"
        }
      ]
    }
  ],
  
  "requirements": {
    "functional": [
      {
        "id": "FR-001",
        "title": "string",
        "description": "string",
        "priority": "high | medium | low",
        "status": "proposed | approved | implemented",
        "dependencies": ["FR-xxx", "NFR-xxx"],
        "acceptance_criteria": ["string"]
      }
    ],
    "non_functional": [
      {
        "id": "NFR-001",
        "type": "performance | security | scalability | usability | reliability | maintainability",
        "title": "string",
        "description": "string",
        "acceptance_threshold": "string",
        "priority": "high | medium | low"
      }
    ]
  },
  
  "user_stories": [
    {
      "id": "US-001",
      "title": "string",
      "as_a": "string (role)",
      "i_want": "string (goal)",
      "so_that": "string (benefit)",
      "priority": "high | medium | low",
      "story_points": "number | null",
      "acceptance_criteria": [
        {
          "id": "AC-001",
          "given": "string (context)",
          "when": "string (action)",
          "then": "string (outcome)"
        }
      ],
      "requirements": ["FR-001"],
      "dependencies": ["US-xxx"]
    }
  ],
  
  "tasks": [
    {
      "id": "TASK-001",
      "title": "string",
      "description": "string",
      "type": "frontend | backend | database | infrastructure | testing | documentation",
      "user_story_id": "US-001",
      "estimated_hours": "number | null",
      "dependencies": ["TASK-xxx"],
      "status": "todo | in_progress | review | done"
    }
  ],
  
  "technical_constraints": [
    {
      "id": "TC-001",
      "constraint": "string",
      "rationale": "string",
      "impact": "string"
    }
  ],
  
  "milestones": [
    {
      "id": "MS-001",
      "name": "string",
      "target_date": "ISO-8601 date | null",
      "deliverables": ["string"],
      "dependencies": ["MS-xxx"]
    }
  ],
  
  "risks": [
    {
      "id": "RISK-001",
      "description": "string",
      "probability": "high | medium | low",
      "impact": "high | medium | low",
      "mitigation": "string"
    }
  ]
}
```

---

## Extraction Patterns

### User Story Detection
Look for patterns:
- "As a [user type]..."
- "Users should be able to..."
- "The system shall allow..."
- Bullet points under "Features" or "Capabilities"

### Acceptance Criteria Detection
Look for patterns:
- "Given... When... Then..." (BDD format)
- "Verify that..."
- "Should [verb]..."
- Numbered lists under user stories
- "Success criteria" sections

### Requirement Priority
Infer from:
- Explicit labels (P0, P1, Must Have, Nice to Have)
- Position in document (earlier = higher priority)
- Language ("critical", "essential" = high; "ideally", "optionally" = low)

### Dependency Detection
Look for:
- "Requires [feature]..."
- "After [feature] is complete..."
- "Depends on..."
- Logical sequences in requirements

---

## Handling Ambiguity

### Missing Information
```json
{
  "id": "US-001",
  "title": "User login",
  "as_a": "registered user",
  "i_want": "to log into my account",
  "so_that": "[NEEDS CLARIFICATION - benefit not specified]",
  "story_points": null,
  "_notes": ["Benefit statement missing from source PRD"]
}
```

### Conflicting Requirements
```json
{
  "_conflicts": [
    {
      "items": ["FR-003", "FR-007"],
      "description": "FR-003 requires single sign-on, FR-007 specifies local auth only",
      "recommendation": "Clarify with stakeholder"
    }
  ]
}
```

### Incomplete Acceptance Criteria
Flag but include:
```json
{
  "acceptance_criteria": [
    {
      "id": "AC-001",
      "given": "user is on login page",
      "when": "user enters valid credentials",
      "then": "[INCOMPLETE - expected outcome not specified]"
    }
  ]
}
```

---

## Output Options

### Full Export
Complete JSON with all sections.

### Task-Only Export
Just tasks for import into project management:
```json
{
  "tasks": [...],
  "export_format": "linear" | "jira" | "asana" | "github_issues"
}
```

### Stories-Only Export
User stories with acceptance criteria for sprint planning.

---

## Validation Checklist

Before finalizing output:
- [ ] All IDs are unique
- [ ] No circular dependencies
- [ ] Every task links to a user story
- [ ] Every story has acceptance criteria
- [ ] Priorities are assigned consistently
- [ ] Missing info flagged with `[NEEDS CLARIFICATION]`
- [ ] JSON validates against schema

---

## Example Transformation

### Input (PRD excerpt)
```markdown
## User Authentication

Users need to be able to create accounts and log in securely.

### Requirements
- Email/password registration
- OAuth with Google and GitHub
- Password reset via email
- Session management with 30-day remember me

### Acceptance Criteria
- Registration validates email format
- Passwords must be 8+ characters
- Failed logins lock account after 5 attempts
```

### Output
```json
{
  "user_stories": [
    {
      "id": "US-001",
      "title": "User Registration",
      "as_a": "new user",
      "i_want": "to create an account with email and password",
      "so_that": "I can access the application",
      "priority": "high",
      "acceptance_criteria": [
        {
          "id": "AC-001",
          "given": "I am on the registration page",
          "when": "I enter an invalid email format",
          "then": "I see a validation error"
        },
        {
          "id": "AC-002",
          "given": "I am registering",
          "when": "I enter a password under 8 characters",
          "then": "I see a password requirements error"
        }
      ]
    }
  ],
  "requirements": {
    "functional": [
      {
        "id": "FR-001",
        "title": "Email/Password Registration",
        "description": "Users can register with email and password",
        "priority": "high"
      },
      {
        "id": "FR-002", 
        "title": "OAuth Integration",
        "description": "Users can register/login via Google and GitHub",
        "priority": "high"
      }
    ],
    "non_functional": [
      {
        "id": "NFR-001",
        "type": "security",
        "title": "Account Lockout",
        "description": "Lock account after failed login attempts",
        "acceptance_threshold": "5 failed attempts triggers 15-minute lockout"
      }
    ]
  }
}
```
