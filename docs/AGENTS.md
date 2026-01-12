# Agents Reference

Specialised agent personas for targeted expertise. Invoke with `@agent-name`.

---

## Quick Reference

| Agent | Use For |
|-------|---------|
| `@frontend-developer` | React, Next.js, UI components, styling |
| `@backend-developer` | APIs, Node, Python, databases |
| `@database-architect` | Schema design, queries, migrations |
| `@devops-engineer` | CI/CD, Docker, Terraform, deployment |
| `@security-auditor` | Vulnerability review, OWASP compliance |
| `@test-engineer` | Unit, integration, E2E tests |
| `@code-reviewer` | PR reviews, quality checks |
| `@technical-writer` | Docs, READMEs, API documentation |
| `@ui-designer` | Design systems, accessibility, responsive |
| `@product-analyst` | PRDs, user stories, requirements |

---

## @frontend-developer

**React, Next.js, React Native, Vue, UI components, state management, styling, animations, and frontend performance.**

### Expertise
- React 19, Next.js 15 (App Router), React Native with Expo
- TypeScript (strict mode, advanced patterns)
- Tailwind CSS, CSS Modules, styled-components
- State management: React Query, Zustand, Jotai
- Testing: Vitest, React Testing Library, Playwright

### Key Patterns

**Next.js 15:**
- Server Components by default
- 'use client' only when needed
- Server Actions for mutations
- loading.tsx and error.tsx boundaries

**React:**
- Functional components only
- Custom hooks for reusable logic
- Suspense boundaries for async

**shadcn/ui:**
- Always asks for preset URL
- Default: Lyra style
- Uses `npx shadcn@latest create --preset`

### When to Use
```bash
@frontend-developer Build a responsive navbar with mobile menu
@frontend-developer Add dark mode toggle to settings
@frontend-developer Create a data table with sorting and filtering
```

---

## @backend-developer

**APIs, server-side logic, database operations, authentication, microservices, and backend architecture.**

### Expertise
- Node.js, Python, Go
- Express, Hono, FastAPI
- PostgreSQL, MongoDB, Redis
- REST and GraphQL APIs
- Message queues, background jobs

### Key Patterns

**API Design:**
- RESTful conventions
- Consistent error responses
- Pagination for lists
- Proper HTTP status codes

**Authentication:**
- JWT or session-based
- Secure password hashing
- Rate limiting
- CORS configuration

**Database:**
- Prisma or Drizzle ORM
- Migrations and seeding
- Connection pooling
- Query optimisation

### When to Use
```bash
@backend-developer Create REST API for user management
@backend-developer Add Stripe webhook handling
@backend-developer Implement job queue for email sending
```

---

## @database-architect

**Schema design, data modelling, query optimisation, migrations, indexing strategies, and database selection.**

### Expertise
- PostgreSQL, MySQL, SQLite
- MongoDB, DynamoDB
- Redis for caching
- Prisma, Drizzle, TypeORM
- Query performance tuning

### Key Patterns

**Schema Design:**
- Normalisation vs denormalisation trade-offs
- Proper foreign key relationships
- Indexing strategies
- Soft deletes where appropriate

**Migrations:**
- Reversible migrations
- Data migrations separate from schema
- Zero-downtime deployments

### When to Use
```bash
@database-architect Design schema for e-commerce platform
@database-architect Optimise slow query on orders table
@database-architect Plan migration from MySQL to PostgreSQL
```

---

## @devops-engineer

**CI/CD pipelines, Docker, Kubernetes, Terraform, cloud infrastructure, deployments, monitoring, and infrastructure automation.**

### Expertise
- Docker and Docker Compose
- GitHub Actions, GitLab CI
- Terraform, Pulumi
- AWS, GCP, Azure
- Vercel, Railway, Fly.io
- Monitoring: Datadog, Grafana

### Key Patterns

**CI/CD:**
- Lint → Test → Build → Deploy
- Environment-specific configs
- Secrets management
- Rollback strategies

**Containerisation:**
- Multi-stage builds
- Small base images
- Health checks
- Proper layer caching

### When to Use
```bash
@devops-engineer Set up GitHub Actions for this repo
@devops-engineer Create Dockerfile for Next.js app
@devops-engineer Configure Terraform for AWS deployment
```

---

## @security-auditor

**Security reviews, vulnerability analysis, penetration testing guidance, OWASP compliance, and security best practices.**

### Expertise
- OWASP Top 10
- Authentication vulnerabilities
- SQL injection, XSS prevention
- CSRF protection
- Secrets management
- Dependency auditing

### Key Checks
- Input validation
- Output encoding
- Authentication/authorisation
- Sensitive data exposure
- Security headers
- Dependency vulnerabilities

### When to Use
```bash
@security-auditor Review auth implementation for vulnerabilities
@security-auditor Audit API endpoints for injection risks
@security-auditor Check if we're handling PII correctly
```

---

## @test-engineer

**Unit tests, integration tests, E2E tests, test architecture, mocking strategies, and test coverage analysis.**

### Expertise
- Vitest, Jest
- React Testing Library
- Playwright, Cypress
- Test doubles (mocks, stubs, spies)
- Coverage reporting
- TDD methodology

### Key Patterns

**Unit Tests:**
- Arrange, Act, Assert
- One assertion per test
- Descriptive test names
- Edge case coverage

**Integration Tests:**
- Test real interactions
- Database fixtures
- API mocking
- Cleanup after tests

**E2E Tests:**
- Critical user paths
- Page Object pattern
- Stable selectors
- Retry strategies

### When to Use
```bash
@test-engineer Write unit tests for the auth service
@test-engineer Create E2E tests for checkout flow
@test-engineer Set up testing infrastructure from scratch
```

---

## @code-reviewer

**Comprehensive code reviews covering correctness, security, performance, maintainability, and adherence to project conventions.**

### Focus Areas
1. Correctness — Logic, edge cases, error handling
2. Security — Injection, auth, data exposure
3. Performance — N+1, memory leaks, caching
4. Code Quality — DRY, naming, conventions
5. TypeScript — No any, proper types
6. Testing — Coverage, meaningful tests
7. Documentation — Comments, API docs

### Output Format
```
🔴 BLOCKERS (must fix)
🟡 SUGGESTIONS (should consider)
🟢 GOOD PATTERNS (worth noting)
```

### When to Use
```bash
@code-reviewer Review my recent changes before PR
@code-reviewer Check this function for issues
@code-reviewer Review the auth implementation
```

---

## @technical-writer

**README files, API documentation, architecture decision records, guides, tutorials, and technical content.**

### Expertise
- README structure
- API documentation (OpenAPI)
- Architecture Decision Records (ADRs)
- User guides and tutorials
- Changelog maintenance

### Documentation Types
- Quick start guides
- API reference
- Integration guides
- Troubleshooting guides
- Architecture docs

### When to Use
```bash
@technical-writer Write README for this project
@technical-writer Document the API endpoints
@technical-writer Create onboarding guide for new devs
```

---

## @ui-designer

**Design systems, component libraries, accessibility, responsive design, animations, and shadcn/ui setup.**

### Expertise
- Design system creation
- Component APIs
- Responsive patterns
- Accessibility (WCAG 2.1)
- Motion design
- shadcn/ui customisation

### Key Patterns

**Design Systems:**
- Tokens (colours, spacing, typography)
- Component variants
- Consistent APIs
- Documentation

**Accessibility:**
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Colour contrast

### When to Use
```bash
@ui-designer Create a design system for this project
@ui-designer Make this component accessible
@ui-designer Add micro-interactions to the form
```

---

## @product-analyst

**PRDs, user stories, requirements gathering, feature specifications, acceptance criteria, and product strategy.**

### Expertise
- Product Requirements Documents
- User stories (Gherkin format)
- Acceptance criteria
- Feature prioritisation
- MVP scoping
- Competitor analysis

### Document Types
- PRDs
- User story maps
- Feature specs
- Acceptance criteria
- Impact assessments

### When to Use
```bash
@product-analyst Write PRD for subscription billing
@product-analyst Define acceptance criteria for login
@product-analyst Prioritise these feature requests
```

---

## Using Agents Effectively

### Combine with Commands
```bash
# Use agent for specific task
@frontend-developer Build the dashboard layout

# Then use command for review
/review

# End session properly
/handoff
```

### Chain Agents
```bash
# Product analysis first
@product-analyst Define requirements for analytics feature

# Then implementation
@backend-developer Build the analytics API
@frontend-developer Create the analytics dashboard

# Then review
@security-auditor Check for data exposure risks
```

### With Ralph
Agents are automatically invoked during Ralph iterations based on story category:
- `database` → database-architect patterns
- `backend` → backend-developer patterns
- `frontend` → frontend-developer patterns
