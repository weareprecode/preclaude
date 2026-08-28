---
description: Full production-readiness audit of a web codebase AND its live site — security, WCAG accessibility, UX, links, SEO, performance, code quality, privacy, infra. Run against a dev server or production URL; produces a dated AUDIT-REPORT.md with severity-ranked findings. Use for "audit the site", "production-readiness check", or pre-launch review.
---

You are performing a complete production-readiness audit of this codebase, acting as a senior security engineer, accessibility specialist, QA lead, and webmaster combined. Work autonomously. Do not ask me questions unless something is genuinely blocking.

## Phase 1: Discovery
1. Map the project: framework, language, package manager, build tooling, deployment target, and folder structure.
2. Identify all routes/pages, API endpoints, forms, and external integrations.
3. Note the intended audience and purpose of the app based on what you find.

## Phase 2: Audit

Run every check that applies to this stack. Where a CLI tool exists (npm audit, pnpm audit, eslint, tsc, lighthouse-ci, pa11y/axe, linkinator or similar), install and run it rather than relying on reading code alone. If the project has a dev server, start it and test against it.

### 1. Security
- Dependency vulnerabilities: run the package manager's audit and list all high/critical CVEs with upgrade paths.
- Secrets: scan the entire repo (including git history if feasible) for API keys, tokens, passwords, connection strings, and private keys. Check .env files are gitignored.
- OWASP Top 10: injection (SQL/NoSQL/command), XSS (reflected, stored, DOM), CSRF protection, broken auth/session handling, insecure deserialisation, SSRF, path traversal, IDOR/broken access control.
- Input validation and output encoding on every form, query param, and API endpoint.
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- CORS configuration: flag wildcard origins or credentialed wildcard setups.
- Auth: password storage, token expiry, refresh logic, rate limiting on login/reset endpoints, privilege escalation paths.
- File uploads: type/size validation, storage location, execution risk.
- Exposed debug endpoints, source maps in production builds, verbose error messages leaking stack traces.
- Client-side storage of sensitive data (localStorage/sessionStorage misuse).

### 2. Accessibility (WCAG 2.2 AA)
- Semantic HTML: heading hierarchy, landmarks, lists, buttons vs links used correctly.
- All images: meaningful alt text or empty alt for decorative.
- Keyboard: every interactive element reachable and operable, visible focus states, no keyboard traps, logical tab order, skip links.
- ARIA: flag redundant, incorrect, or missing ARIA. Prefer native elements.
- Colour contrast: check text and UI components against 4.5:1 / 3:1 minimums.
- Forms: labels associated with inputs, error messages announced and linked via aria-describedby, required fields indicated non-visually too.
- Motion: respect prefers-reduced-motion; flag autoplaying media.
- Dynamic content: live regions for toasts/updates, focus management on modals and route changes.
- Touch targets at least 24x24px, and zoom not disabled.

### 3. Usability and UX
- Every form: validation feedback, error recovery, success confirmation, disabled-state handling during submission.
- Loading, empty, and error states for every data-driven view.
- Responsive behaviour at 320px, 768px, 1024px, 1440px. Flag horizontal scroll, overlapping elements, unreadable text.
- Navigation consistency, back-button behaviour, deep-link support.
- Destructive actions: confirmation or undo.
- 404 and error pages exist and help the user recover.
- Consistency of button styles, terminology, and interaction patterns.

### 4. Links and Routes
- Crawl all internal links and routes; report 404s, redirect chains, and orphaned pages.
- Check all external links resolve (report status codes).
- Verify anchors/fragments point to real IDs.
- Check sitemap.xml and robots.txt exist, are valid, and agree with the actual routes.

### 5. SEO and Metadata
- Unique title and meta description per page, within length limits.
- Canonical tags, Open Graph and Twitter card tags, favicon set.
- Structured data (JSON-LD) validity where present.
- One h1 per page, crawlable content not hidden behind JS where avoidable.
- Lang attribute set correctly.

### 6. Performance
- Bundle analysis: flag oversized dependencies, missing code splitting, duplicate packages.
- Images: format (WebP/AVIF), sizing, lazy loading, missing width/height causing layout shift.
- Render blocking resources, missing caching headers, uncompressed assets.
- Run Lighthouse if possible and report Core Web Vitals (LCP, INP, CLS).
- Unnecessary re-renders or obvious N+1 query patterns.

### 7. Code Quality and Reliability
- Type errors, lint errors, unused exports, dead code.
- Unhandled promise rejections, missing try/catch on IO, swallowed errors.
- console.log/debug statements left in.
- TODO/FIXME/HACK comments: list them.
- Missing or broken tests; whether the test suite passes.
- Hardcoded values that should be config (URLs, ports, magic numbers).

### 8. Privacy and Compliance
- Cookies set without consent mechanism where required.
- PII in logs, analytics payloads, or URLs.
- Third-party scripts loaded and what data they receive.
- Privacy policy and terms links present if the app collects data.

### 9. Infrastructure and Config
- .env.example present and matching actual env usage.
- Build works from a clean install (verify).
- Error monitoring hooked up (or flag its absence).
- Gitignore covering build output, env files, and OS junk.

## Phase 3: Report

Before making any changes, produce AUDIT-REPORT.md at the repo root containing:
1. Executive summary: overall health score per category (1-10) and the five most important issues.
2. Full findings table: ID, category, severity (Critical / High / Medium / Low), file and line, description, and recommended fix.
3. Anything you could not test and why.

## Phase 4: Fix

After writing the report:
1. Fix all Critical and High issues, committing in small logical commits with messages referencing the finding ID.
2. For Medium and Low issues, fix anything safe and mechanical; list the rest as a prioritised backlog at the end of AUDIT-REPORT.md.
3. Do not change product behaviour or visual design without flagging it in the report first.
4. Re-run the relevant checks after fixing to confirm resolution, and update the report with a "Resolved" column.

Constraints:
- Never commit secrets, and never print discovered secrets in full (mask them).
- If a fix requires a dependency major-version bump, note the breaking-change risk instead of applying it blindly.
- If the project lacks a dev server or tests, say so and audit statically.