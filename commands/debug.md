---
description: Analyse error and suggest fixes - paste error message or stack trace
allowed-tools: Read, Grep, Glob, WebSearch
model: opus
argument-hint: [error-message or "paste"]
---

# Debug Error

Analyse an error message or stack trace and suggest fixes.

## Phase 1: Get Error

If $ARGUMENTS provided and not "paste", use that as error.
Otherwise, ask user to paste:

```markdown
Paste your error message or stack trace below, then I'll analyse it.
```

## Phase 2: Parse Error

### Identify Error Type

| Pattern | Type |
|---------|------|
| `TypeError:` | JavaScript type error |
| `SyntaxError:` | Syntax/parsing error |
| `ReferenceError:` | Undefined variable |
| `Module not found` | Import/dependency error |
| `ENOENT` | File not found |
| `ECONNREFUSED` | Connection error |
| `401`, `403` | Auth error |
| `404` | Not found |
| `500` | Server error |
| `Hydration` | React SSR mismatch |
| `NEXT_` | Next.js specific |
| `prisma` | Database error |
| `zod` | Validation error |

### Extract Key Information

From the error, identify:
1. **Error message**: The actual error text
2. **File location**: Which file threw the error
3. **Line number**: Exact line if available
4. **Stack trace**: Call stack for context
5. **Component**: React component if applicable

## Phase 3: Search Codebase

```bash
# Find the file mentioned in error
find . -name "[filename]" 2>/dev/null | grep -v node_modules

# Search for related code
grep -rn "[error-related-term]" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | head -10
```

Read the relevant file around the error line.

## Phase 4: Diagnose

### Common Fixes by Error Type

**Module not found**
- Check import path (relative vs absolute)
- Check if package is installed: `npm ls [package]`
- Check tsconfig paths
- Check file exists and extension

**TypeError: Cannot read properties of undefined**
- Add null check: `value?.property`
- Check if data is loaded before accessing
- Verify API response shape
- Check async timing

**Hydration mismatch**
- Wrap client-only code in `useEffect`
- Use `suppressHydrationWarning` for timestamps
- Check for browser-only APIs (window, localStorage)
- Ensure consistent rendering server/client

**Prisma errors**
- Run `npx prisma generate` after schema changes
- Check database connection string
- Run `npx prisma db push` for schema sync
- Check for missing relations

**Next.js errors**
- Check server vs client component usage
- Verify 'use client' directive placement
- Check dynamic imports for client components
- Review middleware configuration

## Phase 5: Search Web (if needed)

If error is unusual, search for solutions:

```
[error message] site:stackoverflow.com
[error message] site:github.com/vercel/next.js/issues
[error message] nextjs
```

## Phase 6: Provide Solution

```markdown
## 🔍 Error Analysis

### Error
```
[error message]
```

### Cause
[Explanation of why this error occurred]

### Location
`[file:line]`

### Fix

**Option 1** (Recommended)
```typescript
// Before
[problematic code]

// After
[fixed code]
```

**Option 2** (Alternative)
[alternative approach if applicable]

### Prevention
[How to avoid this error in future]

### Related
- [Link to documentation if applicable]
- [Link to similar issue if found]
```

## Common Error Patterns

### "Cannot find module" Fix
```typescript
// Check import path
import { Thing } from "./thing"; // relative
import { Thing } from "@/lib/thing"; // absolute with alias

// Install if missing
npm install [package-name]

// Check tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### "Hydration" Fix
```typescript
// Wrap client-only code
"use client";

import { useEffect, useState } from "react";

function Component() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // or skeleton

  return <ClientOnlyContent />;
}
```

### "Cannot read properties of undefined" Fix
```typescript
// Add optional chaining
const value = data?.nested?.property;

// Add nullish coalescing
const value = data?.property ?? "default";

// Add type guard
if (!data) return null;
```

### "NEXT_REDIRECT" Fix
```typescript
// This is expected! redirect() throws NEXT_REDIRECT
// Don't wrap redirect() in try/catch

// Wrong
try {
  redirect("/dashboard");
} catch (e) {
  // This catches the redirect!
}

// Right
redirect("/dashboard");
// Code after this won't run
```
