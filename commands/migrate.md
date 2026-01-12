---
description: Run migrations - database schema, API versions, major dependency upgrades
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebSearch, AskUserQuestion
model: opus
argument-hint: [migration-type]
---

# Run Migration

Handle database migrations, API upgrades, and major dependency migrations.

## Phase 1: Identify Migration Type

If $ARGUMENTS provided, use that.
Otherwise, use AskUserQuestion:

```json
{
  "questions": [{
    "question": "What type of migration do you need?",
    "header": "Migration",
    "options": [
      {"label": "Database schema", "description": "Create or run Prisma/Drizzle migrations"},
      {"label": "Next.js upgrade", "description": "Upgrade Next.js to latest version"},
      {"label": "React upgrade", "description": "Upgrade React 18 → 19 or similar"},
      {"label": "Dependency upgrade", "description": "Upgrade a specific major dependency"}
    ],
    "multiSelect": false
  }]
}
```

## Database Migration

### Prisma

```bash
# Check current schema status
npx prisma migrate status

# Check for pending changes
npx prisma db pull --print

# Generate migration
npx prisma migrate dev --name [migration-name]

# Apply to production (use with caution)
npx prisma migrate deploy
```

### Create Migration Checklist

1. **Backup database** (especially production)
2. Review schema changes
3. Check for breaking changes
4. Test migration on staging first
5. Plan rollback strategy

### Common Schema Changes

**Add column (safe)**
```prisma
model User {
  id    String @id
  email String
  name  String? // New nullable column - safe to add
}
```

**Add required column (needs default or backfill)**
```prisma
model User {
  id        String   @id
  email     String
  createdAt DateTime @default(now()) // Default value - safe
}
```

**Rename column (breaking)**
```sql
-- Use raw SQL migration for rename
ALTER TABLE "User" RENAME COLUMN "old_name" TO "new_name";
```

**Delete column (irreversible)**
```
⚠️ WARNING: Deleting columns loses data permanently.
1. First deploy code that doesn't use the column
2. Wait for all instances to update
3. Then run migration to drop column
```

### Drizzle

```bash
# Generate migration
npx drizzle-kit generate

# Push to database
npx drizzle-kit push

# Check status
npx drizzle-kit check
```

## Next.js Upgrade

### Check Current Version

```bash
npm ls next
```

### Upgrade Steps

```bash
# Update Next.js and React together
npm install next@latest react@latest react-dom@latest

# Update ESLint config
npm install eslint-config-next@latest
```

### Breaking Changes Checklist

Search for patterns that may need updating:

```bash
# Check for deprecated patterns
grep -rn "getServerSideProps\|getStaticProps" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules
grep -rn "next/router" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules
grep -rn "next/head" --include="*.tsx" --include="*.ts" . 2>/dev/null | grep -v node_modules
```

### Common Next.js Migrations

**Pages Router → App Router**
- Move pages to app directory
- Convert to Server Components by default
- Update data fetching to async components
- Replace `getServerSideProps` with `fetch` in component

**next/router → next/navigation**
```tsx
// Before
import { useRouter } from "next/router";
const router = useRouter();
router.push("/dashboard");

// After
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/dashboard");
```

**next/head → Metadata API**
```tsx
// Before (pages)
import Head from "next/head";
<Head><title>My Page</title></Head>

// After (app)
export const metadata = {
  title: "My Page",
};
```

## React Upgrade

### React 18 → 19

```bash
npm install react@latest react-dom@latest @types/react@latest @types/react-dom@latest
```

### Key Changes

**forwardRef no longer needed**
```tsx
// Before (React 18)
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});

// After (React 19)
function Input({ ref, ...props }: InputProps & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

**use() hook for promises**
```tsx
// New in React 19
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  return comments.map(c => <p key={c.id}>{c.text}</p>);
}
```

**Actions and useActionState**
```tsx
// New form handling
function Form() {
  const [state, formAction, isPending] = useActionState(submitForm, null);
  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={isPending}>Submit</button>
    </form>
  );
}
```

## Dependency Upgrade

### Check for Updates

```bash
# Check outdated packages
npm outdated

# Check for security vulnerabilities
npm audit

# Interactive upgrade (requires npm-check-updates)
npx npm-check-updates -i
```

### Major Version Upgrade Process

1. **Read changelog/migration guide**
   ```bash
   # Search for migration guide
   ```
   Use WebSearch: "[package-name] migration guide v[X] to v[Y]"

2. **Update package**
   ```bash
   npm install [package]@latest
   ```

3. **Fix breaking changes**
   - Check TypeScript errors
   - Run tests
   - Fix deprecation warnings

4. **Test thoroughly**
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   npm run build
   ```

## Phase 2: Execute Migration

Based on migration type, execute the appropriate steps.

## Phase 3: Verify

```bash
# Full verification
npm run typecheck
npm run lint
npm run test
npm run build
npm run dev  # Manual smoke test
```

## Phase 4: Summary

```markdown
## ✅ Migration Complete

### Migration Type
[Database / Next.js / React / Dependency]

### Changes Applied
- [List of changes made]

### Breaking Changes Handled
- [List of breaking changes fixed]

### Verification
- ✅ TypeScript: No errors
- ✅ ESLint: No warnings
- ✅ Tests: All passing
- ✅ Build: Successful

### Rollback Plan
If issues occur:
1. [Rollback step 1]
2. [Rollback step 2]

### Next Steps
- [ ] Test in staging environment
- [ ] Monitor for errors after deploy
- [ ] Update documentation if needed
```
