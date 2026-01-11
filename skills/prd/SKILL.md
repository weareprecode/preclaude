# Technical PRD Generator

## Purpose
Generate comprehensive technical Product Requirements Documents for MVPs without a product manager. Focuses on technical aspects including user stories, architecture, system design, and implementation details.

## When to Invoke
- "Create a PRD for [product]"
- "Write requirements for [feature]"
- "I need a technical spec for [idea]"
- Starting a new project or major feature
- Converting an idea into implementable specifications

---

## Input Requirements

Before generating the PRD, gather:

### Required Inputs
```
<product_description>
[What the product does, core value proposition, key functionality]
</product_description>

<target_audience>
[Who uses this, their technical sophistication, their pain points]
</target_audience>
```

### Optional Inputs (ask if not provided)
- Existing tech stack constraints
- Timeline/deadline
- Budget considerations
- Integration requirements
- Compliance/regulatory needs

---

## PRD Structure

Generate a document with ALL of the following sections:

### 1. Product Overview (2-3 sentences max)
Concise summary: what it is, who it's for, core value.

### 2. User Stories (20+ minimum - DO NOT BE LAZY)
Use Gherkin format for every story:

```gherkin
Feature: [Feature Name]

  Scenario: [Descriptive scenario name]
    Given [initial context/state]
    When [action taken]
    Then [expected outcome]
    And [additional outcomes]

  Scenario: [Another scenario]
    Given [context]
    When [action]
    Then [outcome]
```

**Story Categories to Cover:**
- Authentication & Authorization (5+ stories)
- Core Feature #1 (5+ stories)
- Core Feature #2 (5+ stories)
- Error Handling & Edge Cases (3+ stories)
- Admin/Management (2+ stories)

### 3. User Flows
Step-by-step flows for each major feature:

```
Flow: [Name]
1. User lands on [page]
2. User clicks [element]
3. System displays [response]
4. User enters [data]
5. System validates [rules]
6. On success: [outcome]
7. On failure: [error handling]
```

### 4. Screens and UI/UX
List every screen with:
- Screen name
- Purpose
- Key UI elements
- Primary actions
- Navigation connections
- Mobile considerations

```markdown
### [Screen Name]
**Purpose**: [What user accomplishes here]
**Elements**:
- [Element]: [Purpose]
- [Element]: [Purpose]
**Actions**: [Primary CTA], [Secondary actions]
**Navigates To**: [Connected screens]
```

### 5. Features and Functionality
Technical feature breakdown:

| Feature | Description | Priority | Complexity |
|---------|-------------|----------|------------|
| [Name] | [Technical description] | P0/P1/P2 | Low/Med/High |

### 6. Technical Architecture
High-level system diagram in text:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   API       │────▶│  Database   │
│  (Next.js)  │◀────│  (Node)     │◀────│ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  External   │
                    │  Services   │
                    └─────────────┘
```

Include:
- Frontend stack
- Backend stack  
- Database choice with rationale
- External services/APIs
- Hosting/infrastructure

### 7. System Design
Detailed component breakdown:

```markdown
## Frontend
- Framework: [choice + rationale]
- State Management: [approach]
- Styling: [solution]
- Key Libraries: [list with purposes]

## Backend
- Runtime: [Node/Python/Go + version]
- Framework: [choice]
- Authentication: [method]
- File Storage: [if needed]

## Database
- Type: [SQL/NoSQL + specific DB]
- ORM: [if applicable]
- Caching: [strategy]
```

### 8. API Specifications
Define ALL endpoints:

```markdown
### [Resource Name]

#### GET /api/[resource]
**Description**: [What it does]
**Auth**: Required/Public
**Query Params**:
- `limit`: number (default: 20)
- `offset`: number (default: 0)
**Response**:
```json
{
  "data": [...],
  "meta": { "total": 100, "page": 1 }
}
```

#### POST /api/[resource]
**Description**: [What it does]
**Auth**: Required
**Body**:
```json
{
  "field": "string (required)",
  "field2": "number (optional)"
}
```
**Response**: 201 Created
**Errors**: 400 (validation), 401 (auth), 409 (conflict)
```

### 9. Data Model
Entity definitions with relationships:

```markdown
## Entities

### User
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| email | string | unique, not null |
| password_hash | string | not null |
| created_at | timestamp | default now |

### [Entity]
| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → User.id |
| [field] | [type] | [constraints] |

## Relationships
- User 1:N [Entity]
- [Entity] N:M [OtherEntity] via [JoinTable]
```

### 10. Security Considerations
```markdown
## Authentication
- Method: [JWT/Session/OAuth]
- Token expiry: [duration]
- Refresh strategy: [approach]

## Authorization
- Role types: [list]
- Permission model: [RBAC/ABAC]

## Data Protection
- Encryption at rest: [yes/no + method]
- Encryption in transit: [TLS version]
- PII handling: [approach]

## Input Validation
- [Validation rules]

## Rate Limiting
- [Limits per endpoint type]
```

### 11. Performance Requirements
```markdown
| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load | < 2s | Core Web Vitals |
| API Response | < 200ms | p95 latency |
| Database Query | < 50ms | Average |
| Uptime | 99.9% | Monthly |
| Concurrent Users | [N] | Supported |
```

### 12. Scalability Considerations
```markdown
## Horizontal Scaling
- [Component]: [scaling approach]

## Caching Strategy
- [What to cache, where, TTL]

## Database Scaling
- Read replicas: [when to add]
- Sharding: [if/when needed]

## CDN
- Static assets: [strategy]
- Edge caching: [rules]
```

### 13. Testing Strategy
```markdown
## Unit Tests
- Coverage target: 80%+
- Focus areas: [business logic, utilities]

## Integration Tests
- API endpoints
- Database operations
- External service mocks

## E2E Tests
- Critical user flows
- Tools: Playwright

## Manual Testing
- Checklist for QA
```

### 14. Deployment Plan
```markdown
## Environments
- Development: [setup]
- Staging: [setup]
- Production: [setup]

## CI/CD
- Platform: GitHub Actions
- Pipeline stages: [lint → test → build → deploy]

## Infrastructure
- Hosting: [Vercel/Railway/AWS]
- Database: [managed service]
- Monitoring: [Sentry/DataDog]

## Rollback Strategy
- [How to rollback if issues]
```

### 15. Maintenance and Support
```markdown
## Monitoring
- Error tracking: [tool]
- Performance: [tool]
- Uptime: [tool]

## Logging
- What to log
- Retention policy

## Support
- Channels: [email/chat/etc]
- Response times: [SLA]

## Updates
- Dependency updates: [frequency]
- Security patches: [process]
```

---

## Output Format

```markdown
<prd>
# [Product Name] - Technical PRD

**Version**: 1.0
**Date**: [Date]
**Status**: Draft

---

[All 15 sections with complete content]

---

## Appendix

### Open Questions
- [ ] [Question needing stakeholder input]

### Assumptions
- [Assumption made during PRD creation]

### References
- [Links to relevant resources]
</prd>
```

---

## Quality Checklist

Before finalizing:
- [ ] 20+ user stories in Gherkin format
- [ ] All screens documented
- [ ] API endpoints fully specified
- [ ] Data model complete with relationships
- [ ] Security section addresses OWASP basics
- [ ] Performance targets defined
- [ ] Deployment plan actionable
- [ ] No sections skipped or abbreviated

---

## Converting to Ralph JSON

After PRD approval, use the `/ralph` command or ralph skill to convert to `prd.json` for autonomous execution. Each user story becomes a task that must be:
- Completable in one context window
- Independently verifiable
- Small enough to describe in 2-3 sentences
