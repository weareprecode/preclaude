---
description: Refactor code - extract components, improve types, split files, clean up
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
model: opus
argument-hint: [file-or-pattern]
---

# Refactor Code

Systematically refactor code with common patterns.

## Phase 1: Identify Target

If $ARGUMENTS provided, use that as target.
Otherwise, use AskUserQuestion:

```json
{
  "questions": [{
    "question": "What type of refactoring do you need?",
    "header": "Refactor type",
    "options": [
      {"label": "Extract component", "description": "Pull out reusable component from existing code"},
      {"label": "Split large file", "description": "Break up a file that's grown too big"},
      {"label": "Improve types", "description": "Add/strengthen TypeScript types"},
      {"label": "Clean up code", "description": "Remove dead code, fix naming, improve structure"}
    ],
    "multiSelect": false
  }]
}
```

## Phase 2: Analyse Current Code

Read the target file(s):

```bash
# Find large files that might need splitting
find . -name "*.tsx" -o -name "*.ts" 2>/dev/null | grep -v node_modules | xargs wc -l 2>/dev/null | sort -rn | head -10

# Find files with many exports (might need splitting)
grep -rn "^export" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | cut -d: -f1 | sort | uniq -c | sort -rn | head -10
```

### Code Smell Detection

Look for:
- Files over 300 lines
- Components with more than 5 useState hooks
- Repeated code patterns (DRY violations)
- Mixed concerns (UI + logic in same component)
- Any `any` types
- Overly complex conditionals
- Deep nesting (> 3 levels)

## Phase 3: Refactoring Patterns

### Extract Component

1. Identify self-contained JSX block
2. Identify props needed (what data flows in)
3. Create new file with component
4. Update imports in original file

```tsx
// Before: Large component with repeated card pattern
function Dashboard() {
  return (
    <div>
      <div className="card">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </div>
      <div className="card">
        <h3>{project.name}</h3>
        <p>{project.description}</p>
      </div>
    </div>
  );
}

// After: Extracted reusable Card component
// Card.tsx
interface CardProps {
  title: string;
  description: string;
}

export function Card({ title, description }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// Dashboard.tsx
import { Card } from "./Card";

function Dashboard() {
  return (
    <div>
      <Card title={user.name} description={user.email} />
      <Card title={project.name} description={project.description} />
    </div>
  );
}
```

### Extract Custom Hook

1. Identify stateful logic that can be reused
2. Create hook file with `use` prefix
3. Return needed state and functions
4. Update component to use hook

```tsx
// Before: Logic mixed in component
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser().then(setUser).catch(setError).finally(() => setLoading(false));
  }, []);

  // ... render logic
}

// After: Extracted hook
// useUser.ts
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}

// UserProfile.tsx
function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error } = useUser(userId);
  // ... render logic
}
```

### Split Large File

1. Identify logical groupings (by feature, by type)
2. Create new files for each group
3. Create index.ts for re-exports
4. Update imports throughout codebase

```
# Before
src/utils/helpers.ts (500+ lines)

# After
src/utils/
  index.ts          # Re-exports everything
  string.ts         # String utilities
  date.ts           # Date utilities
  validation.ts     # Validation helpers
  format.ts         # Formatting utilities
```

### Improve Types

1. Find `any` types
2. Identify implicit `any` from missing annotations
3. Create proper interfaces/types
4. Add generics where appropriate

```bash
# Find any types
grep -rn ": any" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules
```

```tsx
// Before
function processData(data: any): any {
  return data.map((item: any) => item.value);
}

// After
interface DataItem {
  id: string;
  value: number;
  metadata?: Record<string, unknown>;
}

function processData(data: DataItem[]): number[] {
  return data.map((item) => item.value);
}
```

### Clean Up Code

**Remove dead code:**
```bash
# Find unused exports (requires ts-prune or similar)
npx ts-prune | head -20

# Find unused variables (eslint)
npm run lint -- --rule "@typescript-eslint/no-unused-vars: error"
```

**Fix naming:**
- Components: PascalCase
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase
- Files: kebab-case or match export name

**Improve structure:**
- Group related code together
- Order: imports → types → constants → component → exports
- Early returns for error cases

## Phase 4: Apply Refactoring

1. Make changes incrementally
2. Run typecheck after each major change
3. Run tests to verify behaviour unchanged
4. Commit at logical checkpoints

```bash
# Verify no breakage
npm run typecheck
npm run lint
npm run test
```

## Phase 5: Summary

```markdown
## ✅ Refactoring Complete

### Changes Made
- Extracted `Card` component from `Dashboard.tsx`
- Created `useUser` hook for data fetching
- Split `helpers.ts` into 4 focused files
- Fixed 12 `any` types

### Files Created
- `src/components/Card.tsx`
- `src/hooks/useUser.ts`
- `src/utils/string.ts`
- `src/utils/date.ts`

### Files Modified
- `src/pages/Dashboard.tsx` (reduced from 450 to 120 lines)
- `src/pages/UserProfile.tsx`

### Verification
- ✅ TypeScript: No errors
- ✅ ESLint: No warnings
- ✅ Tests: All passing

### Impact
- **Lines saved**: ~200 lines of duplication removed
- **Type safety**: 100% typed (was 85%)
- **Reusability**: 3 new reusable components/hooks
```
