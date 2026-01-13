"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { DetailModal, CommandModalContent, AgentModalContent } from "../components/DetailModal";

// Animation variants
const smoothEasing: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEasing }
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// Types
interface Command {
  name: string;
  desc: string;
  fullDescription?: string;
  whenToUse?: string[];
  whatItDoes?: string[];
  example?: string;
}

interface Agent {
  name: string;
  desc: string;
  fullDescription?: string;
  expertise?: string[];
  focusAreas?: string[];
  whenToUse?: string[];
}

// Data - All 24 commands with full documentation
const commands: Command[] = [
  {
    name: "/full-build",
    desc: "Complete workflow: PRD -> prd.json -> Build (Ralph Wiggum)",
    fullDescription: "Complete workflow from idea to autonomous execution. Guides you through product definition and launches Ralph to build it.",
    whenToUse: ["Building new product from scratch", "Want full automation", "Starting MVP"],
    whatItDoes: [
      "Phase 1: Interview — Asks 8 questions about your product",
      "Phase 2: Confirm — Shows summary, waits for 'go'",
      "Phase 3: Generate PRD — Full 15-section PRD with 20+ stories",
      "Phase 4: Convert to Ralph — Creates prd.json with atomic stories",
      "Phase 5: Project Setup — Creates Next.js project with shadcn",
      "Phase 6: Launch — Optionally starts autonomous build"
    ],
    example: '/full-build "CRM for UK tradespeople"\n# Answers 8 questions\n# Type "go" to confirm\n# Project created and Ralph running'
  },
  {
    name: "/implement",
    desc: "Execute full feature implementation from PRD through completion",
    fullDescription: "Execute feature implementation from discovery to completion. Handles the full TDD cycle with quality gates.",
    whenToUse: ["Smaller features (not full products)", "Features that don't need Ralph autonomy", "Direct implementation"],
    whatItDoes: [
      "Discovery — Checks for PRD, roadmap, assesses complexity",
      "Planning — Creates task file for medium/large features",
      "Implementation — TDD cycle (test → implement → refactor)",
      "Quality Gates — Runs lint, typecheck, tests",
      "Documentation — Updates README, CLAUDE.md",
      "Completion — Updates task status, roadmap"
    ],
    example: "/implement add-user-authentication"
  },
  {
    name: "/prd",
    desc: "Generate a comprehensive technical PRD for a product or feature MVP",
    fullDescription: "Generate comprehensive technical PRD with 15 sections including user stories in Gherkin format.",
    whenToUse: ["Planning new feature or product", "Need detailed requirements before building", "Want structured user stories"],
    whatItDoes: [
      "Gathers product description, audience, constraints",
      "Generates 15-section PRD with User Stories, Architecture, API Specs",
      "Creates 20+ user stories in Gherkin format",
      "Saves to docs/prd/[name]-prd.md"
    ],
    example: '/prd "Invoice tracking app for freelancers with Stripe integration"'
  },
  {
    name: "/kickoff",
    desc: "Initialize new project with full structure, CLAUDE.md, and tooling",
    fullDescription: "Initialise new project with full directory structure, CLAUDE.md, and proper tooling setup.",
    whenToUse: ["Starting new project", "Need scaffolding with conventions"],
    whatItDoes: [
      "Gathers requirements (type, framework, database, auth)",
      "Creates directory structure with .github, docs, src, tests",
      "Generates CLAUDE.md with project-specific rules",
      "Initialises git and installs dependencies"
    ],
    example: "/kickoff my-new-app"
  },
  {
    name: "/prd-json",
    desc: "Convert PRD to prd.json format for autonomous build",
    fullDescription: "Convert PRD to prd.json for autonomous build execution. Creates atomic user stories sized to fit one context window.",
    whenToUse: ["Have a PRD ready", "Want autonomous implementation", "Preparing for /build command"],
    whatItDoes: [
      "Analyses PRD for all features",
      "Breaks into atomic user stories",
      "Sizes each story (must fit one context window)",
      "Orders by dependencies",
      "Adds acceptance criteria with quality checks"
    ],
    example: "/prd-json docs/prd/invoice-tracker-prd.md\n# Creates: scripts/ralph/prd.json"
  },
  {
    name: "/build",
    desc: "Run Ralph Wiggum autonomous loop with completion promise",
    fullDescription: "Run Ralph autonomous build loop on existing prd.json. Implements stories one by one, running quality checks and committing.",
    whenToUse: ["You've already run /prd and /prd-json", "Have an existing prd.json ready", "Want to run/resume the build loop"],
    whatItDoes: [
      "Finds scripts/ralph/prd.json",
      "Checks remaining stories",
      "Creates Ralph scripts if missing",
      "Runs autonomous loop for N iterations",
      "Commits on each story completion"
    ],
    example: "/build\n# Or specify iterations:\n/build 25"
  },
  {
    name: "/research",
    desc: "Deep research on competitors, market gaps, and idea validation",
    fullDescription: "Deep web research on competitors, market gaps, and idea validation. Generates comprehensive competitive analysis.",
    whenToUse: ["Before building a new product", "Competitive analysis", "Market validation", "Finding opportunities"],
    whatItDoes: [
      "Identifies search terms from idea",
      "Finds 10+ competitors via web search",
      "Analyses each competitor's features, pricing, UX",
      "Reads reviews and user feedback",
      "Identifies market gaps and opportunities",
      "Generates comprehensive report with Build/Pivot/Don't Build recommendation"
    ],
    example: '/research "Invoice tracking app for freelancers"'
  },
  {
    name: "/commit",
    desc: "Create conventional commit from staged changes",
    fullDescription: "Generate conventional commit message from staged changes. Analyses diff and creates semantic commit message.",
    whenToUse: ["You have changes staged (git add)", "Ready to commit"],
    whatItDoes: [
      "Reads staged diff",
      "Analyses changes",
      "Generates conventional commit message",
      "Asks for confirmation before committing"
    ],
    example: "git add src/components/Button.tsx\n/commit\n# Output: feat(ui): add primary button variant with hover states"
  },
  {
    name: "/pr",
    desc: "Create pull request with auto-generated description",
    fullDescription: "Create pull request from current branch with auto-generated description based on commits and changes.",
    whenToUse: ["Feature branch ready for review", "Need PR description generated from commits"],
    whatItDoes: [
      "Gathers commit history since branching",
      "Analyses changed files and categorises them",
      "Generates PR title and description",
      "Pushes branch if needed",
      "Creates PR via GitHub CLI"
    ],
    example: "/pr main\n# Creates PR from current branch to main"
  },
  {
    name: "/review",
    desc: "Comprehensive code review of staged or recent changes",
    fullDescription: "Comprehensive code review evaluating correctness, security, performance, code quality, TypeScript, testing, and documentation.",
    whenToUse: ["Before creating a PR", "After completing a feature", "Code quality check"],
    whatItDoes: [
      "Gathers staged and unstaged diffs",
      "Evaluates against 7 criteria",
      "Outputs structured review with blockers, suggestions, and good patterns"
    ],
    example: "/review\n# Outputs:\n# 🔴 BLOCKERS (must fix)\n# 🟡 SUGGESTIONS (should consider)\n# 🟢 GOOD PATTERNS"
  },
  {
    name: "/test",
    desc: "Generate tests for existing code - unit, integration, or E2E",
    fullDescription: "Generate tests for existing code. Detects testing framework and generates tests following project patterns.",
    whenToUse: ["Code exists without tests", "Adding test coverage", "TDD refactoring"],
    whatItDoes: [
      "Identifies target (file, component, or untested files)",
      "Detects testing framework (Vitest, Jest, Playwright)",
      "Analyses code for testable scenarios",
      "Generates tests following project patterns",
      "Runs tests to verify"
    ],
    example: "/test src/components/Button.tsx\n# Creates: src/components/Button.test.tsx"
  },
  {
    name: "/debug",
    desc: "Analyse error messages and suggest fixes",
    fullDescription: "Analyse error messages and suggest fixes. Parses error type, extracts location, and provides fix with code examples.",
    whenToUse: ["Have error message or stack trace", "Debugging runtime errors", "Understanding cryptic errors"],
    whatItDoes: [
      "Parses error type and message",
      "Extracts file location and line number",
      "Searches codebase for related code",
      "Diagnoses root cause",
      "Provides fix with code examples"
    ],
    example: '/debug "Cannot read properties of undefined (reading \'map\')"'
  },
  {
    name: "/status",
    desc: "Quick health check - git, lint, types, tests in one view",
    fullDescription: "Quick project health check showing git status, TypeScript type checking, ESLint linting, and test suite results.",
    whenToUse: ["Quick project overview", "Before committing", "After pulling changes"],
    whatItDoes: [
      "Git status (branch, ahead/behind, uncommitted)",
      "TypeScript type checking",
      "ESLint linting",
      "Test suite"
    ],
    example: "/status\n# 📁 GIT: feature/new-feature +3/-0\n# 📝 TYPECHECK: ✅ Types OK\n# 🔍 LINT: ✅ Lint OK\n# 🧪 TESTS: ✅ Tests pass"
  },
  {
    name: "/polish",
    desc: "Polish UI to match a design reference - URL, Figma, or screenshot",
    fullDescription: "Polish UI to match a design reference. Extracts design system from URL, Figma, or screenshot and applies polish changes.",
    whenToUse: ["Matching design mockup", "Improving UI quality", "Extracting design tokens"],
    whatItDoes: [
      "Identifies target component/page",
      "Extracts design system from reference (URL, Figma, screenshot)",
      "Compares current vs reference",
      "Applies polish changes (colours, typography, spacing, effects)"
    ],
    example: "/polish src/components/Header.tsx\n# Asks for design reference, then applies polish"
  },
  {
    name: "/refactor",
    desc: "Refactor code - extract components, improve types, split files",
    fullDescription: "Refactor code by extracting components, improving types, splitting large files, and cleaning up code smells.",
    whenToUse: ["File growing too large", "Repeated code patterns", "Improving type safety", "Cleaning up code"],
    whatItDoes: [
      "Identifies refactoring type needed",
      "Analyses current code for smells",
      "Applies refactoring pattern (extract component, custom hook, split file, improve types, clean dead code)"
    ],
    example: "/refactor src/pages/Dashboard.tsx"
  },
  {
    name: "/migrate",
    desc: "Run migrations - database, Next.js upgrades, dependency updates",
    fullDescription: "Run migrations for database schema, API versions, or major dependency upgrades with proper rollback strategies.",
    whenToUse: ["Database schema changes", "Next.js version upgrade", "React version upgrade", "Major dependency updates"],
    whatItDoes: [
      "Database: Generate and run migrations, handle breaking changes",
      "Next.js: Update packages, fix breaking changes, migrate routers",
      "React: Update React and types, handle API changes",
      "Dependencies: Read changelogs, fix breaking changes"
    ],
    example: "/migrate database\n/migrate nextjs\n/migrate react"
  },
  {
    name: "/deps",
    desc: "Check dependencies - outdated packages, security, bundle size",
    fullDescription: "Check dependencies for outdated packages, security vulnerabilities, and bundle size issues.",
    whenToUse: ["Regular maintenance", "Security audit", "Before major updates", "Bundle optimisation"],
    whatItDoes: [
      "Lists outdated packages",
      "Runs security audit",
      "Categorises updates by risk (patch/minor/major)",
      "Checks bundle sizes",
      "Finds unused dependencies",
      "Generates safe update script"
    ],
    example: "/deps\n# Security: 🔴 Critical: 0, 🟠 High: 1\n# Updates: Patch: 5, Minor: 3, Major: 2"
  },
  {
    name: "/seo",
    desc: "Audit and fix SEO - meta tags, Open Graph, favicon, sitemap",
    fullDescription: "Audit and fix SEO essentials including meta tags, Open Graph, Twitter cards, favicon, sitemap, and robots.txt.",
    whenToUse: ["New project setup", "Pre-launch check", "SEO audit"],
    whatItDoes: [
      "Checks page title and meta description",
      "Checks Open Graph and Twitter card tags",
      "Checks favicon and Apple Touch Icon",
      "Checks sitemap and robots.txt",
      "Creates missing items if requested"
    ],
    example: "/seo audit    # Check current status\n/seo fix      # Create missing items"
  },
  {
    name: "/analytics",
    desc: "Check and setup analytics - PostHog, Google Analytics, Plausible",
    fullDescription: "Check and setup analytics with PostHog, Google Analytics, Plausible, or Vercel Analytics.",
    whenToUse: ["New project needs analytics", "Checking current setup", "Switching providers"],
    whatItDoes: [
      "Checks for existing analytics",
      "Asks which provider to install",
      "Creates provider component and pageview tracker",
      "Updates layout with provider",
      "Creates event helper functions"
    ],
    example: "/analytics posthog\n/analytics check    # Audit current setup"
  },
  {
    name: "/learn",
    desc: "Analyze session, score learnings, propose CLAUDE.md updates",
    fullDescription: "Analyse session and propose CLAUDE.md updates. Scores potential learnings on novelty, frequency, impact, specificity, and durability.",
    whenToUse: ["End of coding session", "After discovering project-specific gotchas", "When patterns emerge"],
    whatItDoes: [
      "Audits current CLAUDE.md (max 300 lines)",
      "Reviews recent commits and file changes",
      "Scores potential learnings (0-10)",
      "Proposes additions/removals with scoring threshold"
    ],
    example: "/learn\n# Output: N|F|I|S|D = 2|2|2|2|2 → 10/10 → ADD"
  },
  {
    name: "/marketing",
    desc: "Generate marketing content from feature or release",
    fullDescription: "Generate multi-platform marketing content including release notes, social posts, email announcements, and blog outlines.",
    whenToUse: ["Feature launch", "Product release", "Need social content"],
    whatItDoes: [
      "Creates release-notes.md",
      "Creates social-twitter.md (tweets and threads)",
      "Creates social-linkedin.md (professional posts)",
      "Creates email-announcement.md",
      "Creates blog-outline.md (SEO-focused)"
    ],
    example: '/marketing "stripe-billing"\n# Creates full content bundle'
  },
  {
    name: "/stakeholder",
    desc: "Generate stakeholder updates - daily, weekly, or full pack",
    fullDescription: "Generate stakeholder updates with daily standups, weekly reports, or full stakeholder presentation packs.",
    whenToUse: ["Daily standup notes", "Weekly status reports", "Stakeholder presentations"],
    whatItDoes: [
      "Daily: Completed today, in progress, tomorrow's focus, blockers",
      "Weekly: Summary metrics, completed features, screenshots, next week plan",
      "Pack: Executive summary, progress metrics, timeline, budget, risks"
    ],
    example: "/stakeholder daily\n/stakeholder weekly\n/stakeholder pack"
  },
  {
    name: "/project-complete",
    desc: "Generate end-of-project documentation suite",
    fullDescription: "Generate end-of-project documentation suite including build journal, features, marketing kit, social content, and technical handoff.",
    whenToUse: ["Project finished", "Ready for launch", "Need comprehensive docs"],
    whatItDoes: [
      "Creates build-journal.md — Day-by-day chronicle",
      "Creates features.md — All features documented",
      "Creates marketing-kit.md — Brand, positioning, pitch",
      "Creates social-content.md — Ready-to-post content",
      "Creates technical-handoff.md — Architecture, setup, decisions"
    ],
    example: "/project-complete"
  },
  {
    name: "/handoff",
    desc: "Create session handoff notes for continuity",
    fullDescription: "Create session handoff notes for continuity. Captures git status, recent changes, and creates structured handoff document.",
    whenToUse: ["Stopping work mid-task", "End of day", "Before context switch"],
    whatItDoes: [
      "Captures git status and recent changes",
      "Creates structured handoff document",
      "Includes: Session summary, completed items, in-progress work, decisions made, next priorities"
    ],
    example: "/handoff\n# Creates: docs/handoff/2024-01-15-session.md"
  },
  {
    name: "/deploy-check",
    desc: "Pre-deployment verification checklist",
    fullDescription: "Pre-deployment verification checklist checking git, code quality, tests, build, environment, dependencies, database, and documentation.",
    whenToUse: ["Before deploying to production", "Release candidate check", "CI/CD verification"],
    whatItDoes: [
      "Git — Correct branch, clean working directory, commits pushed",
      "Code Quality — Linting, type checking",
      "Tests — Unit, E2E passing",
      "Build — Completes without errors",
      "Environment — Env vars documented",
      "Dependencies — Security audit, outdated packages"
    ],
    example: "/deploy-check\n# RESULT: READY TO DEPLOY ✅"
  },
];

// Data - All 15 agents with full documentation
const agents: Agent[] = [
  {
    name: "@frontend-developer",
    desc: "React, Next.js, UI components, state management",
    fullDescription: "React, Next.js, React Native, Vue, UI components, state management, styling, animations, and frontend performance.",
    expertise: [
      "React 19, Next.js 15 (App Router), React Native with Expo",
      "TypeScript (strict mode, advanced patterns)",
      "Tailwind CSS, CSS Modules, styled-components",
      "State management: React Query, Zustand, Jotai",
      "Testing: Vitest, React Testing Library, Playwright"
    ],
    focusAreas: [
      "Server Components by default, 'use client' only when needed",
      "Server Actions for mutations",
      "Custom hooks for reusable logic",
      "shadcn/ui with Lyra style preset"
    ],
    whenToUse: [
      "@frontend-developer Build a responsive navbar with mobile menu",
      "@frontend-developer Add dark mode toggle to settings",
      "@frontend-developer Create a data table with sorting and filtering"
    ]
  },
  {
    name: "@backend-developer",
    desc: "APIs, server-side logic, database operations",
    fullDescription: "APIs, server-side logic, database operations, authentication, microservices, and backend architecture.",
    expertise: [
      "Node.js, Python, Go",
      "Express, Hono, FastAPI",
      "PostgreSQL, MongoDB, Redis",
      "REST and GraphQL APIs",
      "Message queues, background jobs"
    ],
    focusAreas: [
      "RESTful conventions with consistent error responses",
      "JWT or session-based authentication",
      "Prisma or Drizzle ORM",
      "Rate limiting and CORS configuration"
    ],
    whenToUse: [
      "@backend-developer Create REST API for user management",
      "@backend-developer Add Stripe webhook handling",
      "@backend-developer Implement job queue for email sending"
    ]
  },
  {
    name: "@database-architect",
    desc: "Schema design, queries, migrations, indexing",
    fullDescription: "Schema design, data modelling, query optimisation, migrations, indexing strategies, and database selection.",
    expertise: [
      "PostgreSQL, MySQL, SQLite",
      "MongoDB, DynamoDB",
      "Redis for caching",
      "Prisma, Drizzle, TypeORM",
      "Query performance tuning"
    ],
    focusAreas: [
      "Normalisation vs denormalisation trade-offs",
      "Proper foreign key relationships",
      "Indexing strategies",
      "Zero-downtime migrations"
    ],
    whenToUse: [
      "@database-architect Design schema for e-commerce platform",
      "@database-architect Optimise slow query on orders table",
      "@database-architect Plan migration from MySQL to PostgreSQL"
    ]
  },
  {
    name: "@devops-engineer",
    desc: "CI/CD, Docker, Kubernetes, infrastructure",
    fullDescription: "CI/CD pipelines, Docker, Kubernetes, Terraform, cloud infrastructure, deployments, monitoring, and infrastructure automation.",
    expertise: [
      "Docker and Docker Compose",
      "GitHub Actions, GitLab CI",
      "Terraform, Pulumi",
      "AWS, GCP, Azure",
      "Vercel, Railway, Fly.io"
    ],
    focusAreas: [
      "Lint → Test → Build → Deploy pipelines",
      "Multi-stage Docker builds",
      "Secrets management",
      "Rollback strategies"
    ],
    whenToUse: [
      "@devops-engineer Set up GitHub Actions for this repo",
      "@devops-engineer Create Dockerfile for Next.js app",
      "@devops-engineer Configure Terraform for AWS deployment"
    ]
  },
  {
    name: "@security-auditor",
    desc: "Security reviews, vulnerability analysis",
    fullDescription: "Security reviews, vulnerability analysis, penetration testing guidance, OWASP compliance, and security best practices.",
    expertise: [
      "OWASP Top 10",
      "Authentication vulnerabilities",
      "SQL injection, XSS prevention",
      "CSRF protection",
      "Secrets management"
    ],
    focusAreas: [
      "Input validation",
      "Output encoding",
      "Authentication/authorisation",
      "Security headers"
    ],
    whenToUse: [
      "@security-auditor Review auth implementation for vulnerabilities",
      "@security-auditor Audit API endpoints for injection risks",
      "@security-auditor Check if we're handling PII correctly"
    ]
  },
  {
    name: "@test-engineer",
    desc: "Unit tests, integration tests, E2E tests",
    fullDescription: "Unit tests, integration tests, E2E tests, test architecture, mocking strategies, and test coverage analysis.",
    expertise: [
      "Vitest, Jest",
      "React Testing Library",
      "Playwright, Cypress",
      "Test doubles (mocks, stubs, spies)",
      "TDD methodology"
    ],
    focusAreas: [
      "Arrange, Act, Assert pattern",
      "One assertion per test",
      "Edge case coverage",
      "Page Object pattern for E2E"
    ],
    whenToUse: [
      "@test-engineer Write unit tests for the auth service",
      "@test-engineer Create E2E tests for checkout flow",
      "@test-engineer Set up testing infrastructure from scratch"
    ]
  },
  {
    name: "@code-reviewer",
    desc: "Code review, best practices",
    fullDescription: "Comprehensive code reviews covering correctness, security, performance, maintainability, and adherence to project conventions.",
    expertise: [
      "Correctness — Logic, edge cases, error handling",
      "Security — Injection, auth, data exposure",
      "Performance — N+1, memory leaks, caching",
      "Code Quality — DRY, naming, conventions",
      "TypeScript — No any, proper types"
    ],
    focusAreas: [
      "🔴 BLOCKERS (must fix)",
      "🟡 SUGGESTIONS (should consider)",
      "🟢 GOOD PATTERNS (worth noting)"
    ],
    whenToUse: [
      "@code-reviewer Review my recent changes before PR",
      "@code-reviewer Check this function for issues",
      "@code-reviewer Review the auth implementation"
    ]
  },
  {
    name: "@technical-writer",
    desc: "Documentation, guides, tutorials",
    fullDescription: "README files, API documentation, architecture decision records, guides, tutorials, and technical content.",
    expertise: [
      "README structure",
      "API documentation (OpenAPI)",
      "Architecture Decision Records (ADRs)",
      "User guides and tutorials",
      "Changelog maintenance"
    ],
    focusAreas: [
      "Quick start guides",
      "API reference",
      "Integration guides",
      "Troubleshooting guides"
    ],
    whenToUse: [
      "@technical-writer Write README for this project",
      "@technical-writer Document the API endpoints",
      "@technical-writer Create onboarding guide for new devs"
    ]
  },
  {
    name: "@ui-designer",
    desc: "Design systems, accessibility, animations",
    fullDescription: "Design systems, component libraries, accessibility, responsive design, animations, and shadcn/ui setup.",
    expertise: [
      "Design system creation",
      "Component APIs",
      "Responsive patterns",
      "Accessibility (WCAG 2.1)",
      "Motion design"
    ],
    focusAreas: [
      "Tokens (colours, spacing, typography)",
      "Component variants",
      "Semantic HTML and ARIA labels",
      "Keyboard navigation and focus management"
    ],
    whenToUse: [
      "@ui-designer Create a design system for this project",
      "@ui-designer Make this component accessible",
      "@ui-designer Add micro-interactions to the form"
    ]
  },
  {
    name: "@ux-researcher",
    desc: "User research, usability testing",
    fullDescription: "User research, information architecture, user flows, wireframes, usability testing, personas, and UX strategy.",
    expertise: [
      "User research planning and execution",
      "Information architecture and content strategy",
      "User flows and journey mapping",
      "Wireframing and low-fidelity prototyping",
      "Persona development and jobs-to-be-done"
    ],
    focusAreas: [
      "What to build and why",
      "User research and insights",
      "Wireframes and flows",
      "Usability testing"
    ],
    whenToUse: [
      "@ux-researcher Create user personas for this product",
      "@ux-researcher Map the checkout user flow",
      "@ux-researcher Design a usability test for the onboarding"
    ]
  },
  {
    name: "@product-analyst",
    desc: "PRDs, user stories, requirements",
    fullDescription: "PRDs, user stories, requirements gathering, feature specifications, acceptance criteria, and product strategy.",
    expertise: [
      "Product Requirements Documents",
      "User stories (Gherkin format)",
      "Acceptance criteria",
      "Feature prioritisation",
      "MVP scoping"
    ],
    focusAreas: [
      "PRDs",
      "User story maps",
      "Feature specs",
      "Impact assessments"
    ],
    whenToUse: [
      "@product-analyst Write PRD for subscription billing",
      "@product-analyst Define acceptance criteria for login",
      "@product-analyst Prioritise these feature requests"
    ]
  },
  {
    name: "@performance-engineer",
    desc: "Core Web Vitals, bundle analysis, optimisation",
    fullDescription: "Core Web Vitals, bundle analysis, Lighthouse audits, profiling, caching strategies, and performance optimisation.",
    expertise: [
      "Core Web Vitals (LCP, INP, CLS)",
      "Bundle analysis and tree-shaking",
      "React profiling and re-render optimisation",
      "Image and asset optimisation",
      "Caching strategies (CDN, browser, service worker)"
    ],
    focusAreas: [
      "LCP ≤2.5s, INP ≤200ms, CLS ≤0.1",
      "Bundle Size <200KB gzipped",
      "Lighthouse Performance >90",
      "Dynamic imports and code splitting"
    ],
    whenToUse: [
      "@performance-engineer Audit and improve page load times",
      "@performance-engineer Analyse and reduce bundle size",
      "@performance-engineer Optimise React component renders"
    ]
  },
  {
    name: "@expo-developer",
    desc: "React Native with Expo",
    fullDescription: "React Native with Expo, cross-platform mobile apps, Expo Router navigation, EAS builds, and mobile-specific UI patterns.",
    expertise: [
      "Expo SDK 52+ and Expo Router",
      "React Native 0.76+ (New Architecture)",
      "TypeScript for mobile development",
      "EAS Build, Submit, and Update",
      "React Native Reanimated and Gesture Handler"
    ],
    focusAreas: [
      "File-based routing with Expo Router",
      "Platform.select() for platform-specific code",
      "NativeWind for Tailwind-style styling",
      "FlashList for long lists"
    ],
    whenToUse: [
      "@expo-developer Build a cross-platform mobile app",
      "@expo-developer Set up EAS builds for App Store and Play Store",
      "@expo-developer Add gesture-based navigation"
    ]
  },
  {
    name: "@ios-developer",
    desc: "Swift, iOS development",
    fullDescription: "Native iOS development with Swift, SwiftUI, UIKit, Core Data, and App Store deployment.",
    expertise: [
      "Swift 5.9+ and Swift Concurrency",
      "SwiftUI (iOS 17+) and UIKit",
      "Core Data and SwiftData",
      "Combine and async/await",
      "Xcode, Instruments, and TestFlight"
    ],
    focusAreas: [
      "@State, @Binding, @StateObject, @ObservedObject",
      "NavigationStack for navigation",
      "MVVM with ObservableObject",
      "XCTest and XCUITest"
    ],
    whenToUse: [
      "@ios-developer Build a native iOS app with SwiftUI",
      "@ios-developer Implement Core Data persistence",
      "@ios-developer Prepare app for App Store submission"
    ]
  },
  {
    name: "@android-developer",
    desc: "Kotlin, Android development",
    fullDescription: "Native Android development with Kotlin, Jetpack Compose, Room, and Play Store deployment.",
    expertise: [
      "Kotlin 2.0+ and Coroutines",
      "Jetpack Compose (Material 3)",
      "Android Architecture Components",
      "Room, DataStore, and Hilt",
      "Android Studio and Gradle"
    ],
    focusAreas: [
      "@Composable functions",
      "State hoisting with remember",
      "MVVM with ViewModel and StateFlow",
      "Hilt for dependency injection"
    ],
    whenToUse: [
      "@android-developer Build a native Android app with Compose",
      "@android-developer Set up Room database with migrations",
      "@android-developer Configure Hilt dependency injection"
    ]
  },
];

// FAQ Data
const faqs = [
  {
    question: "What is Preclaude?",
    answer: "Preclaude is a pre-configured setup for Claude Code that includes 24 slash commands, 15 specialist agents, and Ralph - an autonomous builder. It supercharges your Claude Code experience with production-ready workflows."
  },
  {
    question: "How do I install Preclaude?",
    answer: "Simply run the install command in your terminal: curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash. It works on macOS and Linux. After installation, restart Claude Code to load the new commands and agents."
  },
  {
    question: "What is Ralph?",
    answer: "Ralph is an autonomous builder that takes your PRD (Product Requirements Document) and builds it story by story, committing as it goes. It reads prd.json, implements stories one at a time, runs typecheck/lint/tests, and commits automatically."
  },
  {
    question: "Do I need Claude Code installed first?",
    answer: "Yes, Preclaude requires Claude Code to be installed. It extends Claude Code with additional commands, agents, and workflows."
  },
  {
    question: "Is Preclaude free to use?",
    answer: "Yes, Preclaude is open source and released under the MIT License. You can use it freely in personal and commercial projects."
  },
  {
    question: "Can I customise the commands and agents?",
    answer: "Absolutely! All commands and agents are stored as markdown files in your ~/.claude directory. You can modify existing ones or add your own."
  },
  {
    question: "What's the difference between commands and agents?",
    answer: "Commands (/command) are specific workflows like /commit or /review. Agents (@agent) are specialist personas like @frontend-developer or @security-auditor that bring domain expertise to conversations."
  },
];

// Copy button component
function CopyButton() {
  const [copied, setCopied] = useState(false);
  const installCommand = "curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-[7px] bg-[#0A0908] hover:bg-[#1a1918] transition-colors flex-shrink-0"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M5 11L9 15L17 7" stroke="#9C9C99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <Image src="/copy-icon.svg" alt="Copy" width={22} height={22} />
      )}
    </button>
  );
}

// Mobile menu component
function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          />
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-4 right-4 bg-[#171615] border border-[#2D2B2B] rounded-xl p-4 z-50 md:hidden"
          >
            <div className="flex flex-col gap-2">
              <a href="#ralph" onClick={onClose} className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors">Ralph</a>
              <a href="#commands" onClick={onClose} className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors">Slash Commands</a>
              <a href="#agents" onClick={onClose} className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors">Agents</a>
              <a href="#faqs" onClick={onClose} className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors">FAQs</a>
              <a href="#" onClick={onClose} className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors">Blog</a>
              <hr className="border-[#2D2B2B] my-2" />
              <a
                href="https://github.com/weareprecode/preclaude"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-base text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                View Github
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Command card component - now clickable
function CommandCard({ command, onClick }: { command: Command; onClick: () => void }) {
  return (
    <motion.button
      variants={fadeInUp}
      onClick={onClick}
      className="p-5 sm:p-6 rounded-xl bg-[#171615] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#1a1918] transition-all duration-300 text-left cursor-pointer w-full"
    >
      <code className="text-white font-mono text-base sm:text-lg font-medium">{command.name}</code>
      <p className="mt-2 sm:mt-3 text-[#9C9C99] text-sm leading-relaxed">{command.desc}</p>
    </motion.button>
  );
}

// Agent card component - now clickable
function AgentCard({ agent, onClick }: { agent: Agent; onClick: () => void }) {
  return (
    <motion.button
      variants={fadeInUp}
      onClick={onClick}
      className="p-5 sm:p-6 rounded-xl bg-[#171615] border border-white/[0.06] hover:border-white/[0.12] hover:bg-[#1a1918] transition-all duration-300 text-left cursor-pointer w-full"
    >
      <code className="text-white font-mono text-base sm:text-lg font-medium">{agent.name}</code>
      <p className="mt-2 sm:mt-3 text-[#9C9C99] text-sm leading-relaxed">{agent.desc}</p>
    </motion.button>
  );
}

// FAQ Accordion Item
function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="faq-item pb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-2 text-left"
      >
        <span className="text-sm sm:text-base text-white" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <Image src="/chevron-down.svg" alt="" width={16} height={16} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-[#9C9C99] leading-relaxed pb-2">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// FAQ Section Component
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="w-full max-w-[538px] mx-auto">
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? null : index)}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState<Command | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const installCommand = "curl -fsSL https://raw.githubusercontent.com/weareprecode/preclaude/main/install-remote.sh | bash";

  return (
    <main className="min-h-screen bg-[#0A0908] overflow-x-hidden">
      {/* Command Modal */}
      <DetailModal
        isOpen={!!selectedCommand}
        onClose={() => setSelectedCommand(null)}
        title={selectedCommand?.name || ""}
      >
        {selectedCommand && <CommandModalContent command={selectedCommand} />}
      </DetailModal>

      {/* Agent Modal */}
      <DetailModal
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        title={selectedAgent?.name || ""}
      >
        {selectedAgent && <AgentModalContent agent={selectedAgent} />}
      </DetailModal>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-4 md:px-10 py-2.5">
        <div className="flex items-center gap-4">
          {/* Brand */}
          <a href="/" className="flex items-center">
            <Image src="/logo-brand.svg" alt="Preclaude" width={137} height={29} className="h-7 w-auto" />
          </a>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#ralph" className="px-1 py-1.5 text-sm text-white hover:text-white/80 transition-colors">Ralph</a>
            <a href="#commands" className="px-1 py-1.5 text-sm text-white hover:text-white/80 transition-colors">Slash Commands</a>
            <a href="#agents" className="px-1 py-1.5 text-sm text-white hover:text-white/80 transition-colors">Agents</a>
            <a href="#faqs" className="px-1 py-1.5 text-sm text-white hover:text-white/80 transition-colors">FAQs</a>
            <a href="#" className="px-1 py-1.5 text-sm text-white hover:text-white/80 transition-colors">Blog</a>
          </div>
        </div>

        {/* GitHub Button - Desktop */}
        <a
          href="https://github.com/weareprecode/preclaude"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex px-3 py-1.5 text-base text-white border border-white rounded-full hover:bg-white/10 transition-colors"
        >
          View Github
        </a>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Hero Section */}
      <section className="px-4 pt-12 sm:pt-20 pb-12 sm:pb-20">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center text-center gap-5 sm:gap-7"
          >
            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-5xl md:text-[64px] font-bold leading-[1.1] text-white"
            >
              Supercharge Your<br className="sm:hidden" /><span className="hidden sm:inline">&nbsp;</span>Claude Code
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-xl text-[#9C9C99] max-w-[780px] leading-relaxed px-2"
            >
              24 slash commands, 15 specialist agents, and Ralph autonomous builder — all pre-configured and ready to use.
            </motion.p>

            {/* Install Command */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-[17px] py-3 sm:py-3.5 bg-[#171615] border border-[#2D2B2B] rounded-[7px] w-full max-w-full sm:max-w-fit overflow-hidden"
            >
              <code className="text-xs sm:text-sm text-white font-mono truncate flex-1 sm:flex-none sm:max-w-[568px]">
                {installCommand}
              </code>
              <CopyButton />
            </motion.div>

            {/* GitHub Button */}
            <motion.div variants={fadeInUp}>
              <a
                href="https://github.com/weareprecode/preclaude"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 sm:px-7 py-2.5 sm:py-3 text-sm sm:text-base text-white border border-[#CDCDC9] rounded-full hover:bg-white/10 transition-colors"
              >
                View Github
              </a>
            </motion.div>
          </motion.div>

          {/* Hero Video with Frame Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 sm:mt-16 relative"
          >
            {/* Oil painting background */}
            <div className="absolute inset-0 rounded-xl sm:rounded-[18px] overflow-hidden">
              <Image
                src="/hero-bg.png"
                alt=""
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Window frame with video */}
            <div className="relative z-10 p-4 sm:p-8 md:p-12">
              <div className="rounded-lg overflow-hidden shadow-2xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                  poster="/hero-screenshot.png"
                >
                  <source src="/hero-video.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ralph Section */}
      <section id="ralph" className="px-4 py-12 sm:py-20">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <div className="bg-[#171615] rounded-lg p-4 sm:p-6 overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Ralph Screenshot */}
                <motion.div variants={fadeInUp} className="md:w-1/2">
                  <div className="rounded-[9px] overflow-hidden">
                    <Image
                      src="/ralph-screenshot.png"
                      alt="Ralph builder interface"
                      width={1208}
                      height={654}
                      className="w-full h-auto"
                    />
                  </div>
                </motion.div>

                {/* Ralph Content */}
                <motion.div variants={fadeInUp} className="md:w-1/2 flex flex-col justify-center p-2 sm:p-6">
                  <div className="space-y-2 mb-4 sm:mb-5">
                    <h2 className="text-2xl sm:text-[32px] font-semibold text-white leading-tight">
                      Meet&nbsp;Ralph
                    </h2>
                    <p className="text-sm sm:text-base text-[#9C9C99]">
                      Your Autonomous Builder
                    </p>
                  </div>

                  <p className="text-sm text-white leading-relaxed mb-4">
                    Ralph takes your PRD and builds it story by story, committing as it goes. No hand-holding required — just set iterations and let Ralph work.
                  </p>

                  <ul className="space-y-2 text-sm text-white list-disc list-inside mb-4">
                    <li>Reads prd.json for user stories</li>
                    <li>Implements one story at a time</li>
                    <li>Runs typecheck, lint, and tests</li>
                    <li>Commits and moves to next story</li>
                  </ul>

                  <p className="text-xs text-[#666665]">
                    Powered by{" "}
                    <a
                      href="https://github.com/anthropics/claude-code/tree/main/plugins/official/ralph-loop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#9C9C99] transition-colors"
                    >
                      Ralph Wiggum
                    </a>
                    {" "}by{" "}
                    <a
                      href="https://github.com/ghuntley"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#9C9C99] transition-colors"
                    >
                      Geoffrey Huntley
                    </a>
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Commands Section */}
      <section id="commands" className="px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-[1.1]">
                <span className="text-white">24</span> Slash Commands
              </h2>
              <p className="text-base sm:text-xl text-[#9C9C99] max-w-2xl mx-auto">
                From project kickoff to deployment — every workflow covered.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            >
              {commands.map((cmd) => (
                <CommandCard
                  key={cmd.name}
                  command={cmd}
                  onClick={() => setSelectedCommand(cmd)}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-[1.1]">
                <span className="text-white">15</span> Specialist Agents
              </h2>
              <p className="text-base sm:text-xl text-[#9C9C99] max-w-2xl mx-auto">
                Expert knowledge for every part of your stack.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            >
              {agents.map((agent) => (
                <AgentCard
                  key={agent.name}
                  agent={agent}
                  onClick={() => setSelectedAgent(agent)}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="px-4 py-16 sm:py-24">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="flex flex-col items-center gap-6 sm:gap-10"
          >
            {/* Header */}
            <motion.div variants={fadeInUp} className="text-center px-2">
              <h2 className="text-2xl sm:text-4xl md:text-[48px] font-bold text-white leading-tight mb-2">
                Frequently asked questions
              </h2>
              <p className="text-base sm:text-xl text-white">
                Everything you need to know about Preclaude
              </p>
            </motion.div>

            {/* FAQ Accordion - Centered */}
            <motion.div variants={fadeInUp} className="w-full flex justify-center px-2 sm:px-0">
              <FAQSection />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-8 sm:py-12">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="bg-[#171615] rounded-2xl sm:rounded-[31px] py-8 sm:py-12 px-4 sm:px-8 flex flex-col items-center"
          >
            {/* Icon */}
            <motion.div variants={fadeInUp} className="mb-2">
              <Image src="/cta-icon.svg" alt="" width={88} height={87} className="w-16 h-16 sm:w-[88px] sm:h-[87px]" />
            </motion.div>

            {/* Headline */}
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-5xl md:text-[60px] font-bold text-[#FFFCF9] leading-tight text-center mb-2 sm:mb-3">
              Ready to Start?
            </motion.h2>

            {/* Subheadline */}
            <motion.p variants={fadeInUp} className="text-base sm:text-xl text-[#FFFCF9] text-center mb-4 sm:mb-6">
              One command. That&apos;s it.
            </motion.p>

            {/* Install Command */}
            <motion.div variants={fadeInUp} className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-[640px]">
              <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-[17px] py-3 sm:py-3.5 bg-[#0A0908] border border-[#2D2B2B] rounded-[7px] w-full justify-center overflow-hidden">
                <code className="text-xs sm:text-sm text-white font-mono truncate flex-1 text-center">
                  {installCommand}
                </code>
                <CopyButton />
              </div>
              <p className="text-xs text-[#EEEBE8] text-center px-2">
                Works on macOS and Linux. Requires{" "}
                <a href="https://docs.anthropic.com/en/docs/claude-code" target="_blank" rel="noopener noreferrer" className="underline">
                  Claude Code
                </a>
                {" "}to be installed.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Improved mobile layout */}
      <footer className="px-4 py-8 pb-12">
        <div className="max-w-[1100px] mx-auto flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:gap-4">
          {/* Brand section - stacked on mobile */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-3">
            {/* Brand */}
            <a href="/" className="flex items-center">
              <Image src="/logo-brand.svg" alt="Preclaude" width={137} height={29} className="h-7 w-auto" />
            </a>
            {/* Meta info */}
            <div className="flex items-center gap-2 text-xs text-[#666665]">
              <span>MIT License</span>
              <span>·</span>
              <a
                href="https://precode.co"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9C9C99] transition-colors"
              >
                Built by Precode
              </a>
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/weareprecode/preclaude"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[#666665] hover:text-[#9C9C99] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a
              href="https://x.com/weareprecode"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-[#666665] hover:text-[#9C9C99] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
