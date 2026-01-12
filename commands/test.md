---
description: Generate tests for existing code - unit, integration, or E2E
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
argument-hint: [file-or-component]
---

# Generate Tests

Generate tests for existing code. Follows project conventions and creates colocated test files.

## Phase 1: Identify Target

If $ARGUMENTS provided, use that as target. Otherwise, ask:

Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "What would you like to test?",
    "header": "Target",
    "options": [
      {"label": "Specific file", "description": "I'll provide a file path to test"},
      {"label": "Untested files", "description": "Find files without tests and generate them"},
      {"label": "Recent changes", "description": "Generate tests for recently modified files"},
      {"label": "Critical paths", "description": "Test auth, payments, and core business logic"}
    ],
    "multiSelect": false
  }]
}
```

## Phase 2: Detect Test Setup

```bash
# Check testing framework
cat package.json | grep -E "vitest|jest|playwright|cypress" | head -5

# Find existing tests to learn patterns
find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" 2>/dev/null | grep -v node_modules | head -5

# Check for test config
ls vitest.config.* jest.config.* playwright.config.* 2>/dev/null
```

### Identify Test Patterns

Read 1-2 existing test files to understand:
- Import style
- Describe/it structure
- Mocking patterns
- Assertion style
- Setup/teardown

## Phase 3: Analyse Target

Read the target file and identify:

### For Components
- Props interface
- User interactions (clicks, inputs, form submissions)
- Conditional rendering
- Error states
- Loading states
- Accessibility requirements

### For Functions/Utilities
- Input types and edge cases
- Return values
- Error conditions
- Side effects

### For API Routes/Server Actions
- Request/response shapes
- Authentication requirements
- Validation rules
- Error handling
- Database interactions

## Phase 4: Generate Tests

### Component Test Template (Vitest + RTL)

```typescript
// ComponentName.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  it("renders correctly", () => {
    render(<ComponentName />);
    expect(screen.getByRole("...")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(<ComponentName onAction={onAction} />);

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(onAction).toHaveBeenCalledOnce();
  });

  it("shows loading state", () => {
    render(<ComponentName isLoading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<ComponentName error="Something went wrong" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });
});
```

### Utility Function Test Template

```typescript
// utils.test.ts
import { describe, it, expect } from "vitest";
import { functionName } from "./utils";

describe("functionName", () => {
  it("returns expected result for valid input", () => {
    expect(functionName("input")).toBe("expected");
  });

  it("handles edge case: empty input", () => {
    expect(functionName("")).toBe("");
  });

  it("handles edge case: null/undefined", () => {
    expect(functionName(null)).toBeNull();
  });

  it("throws for invalid input", () => {
    expect(() => functionName(-1)).toThrow("Invalid input");
  });
});
```

### API Route Test Template

```typescript
// route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("GET /api/resource", () => {
  it("returns 200 with data", async () => {
    const request = new NextRequest("http://localhost/api/resource");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("items");
  });

  it("returns 401 when unauthenticated", async () => {
    const request = new NextRequest("http://localhost/api/resource");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});

describe("POST /api/resource", () => {
  it("creates resource and returns 201", async () => {
    const request = new NextRequest("http://localhost/api/resource", {
      method: "POST",
      body: JSON.stringify({ name: "Test" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
  });

  it("returns 400 for invalid body", async () => {
    const request = new NextRequest("http://localhost/api/resource", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

### Server Action Test Template

```typescript
// actions.test.ts
import { describe, it, expect, vi } from "vitest";
import { createItem, deleteItem } from "./actions";

vi.mock("@/lib/db");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("createItem", () => {
  it("creates item and revalidates path", async () => {
    const formData = new FormData();
    formData.append("name", "Test Item");

    const result = await createItem(formData);

    expect(result.success).toBe(true);
    expect(result.item).toHaveProperty("id");
  });

  it("returns error for invalid data", async () => {
    const formData = new FormData();
    // Missing required fields

    const result = await createItem(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

## Phase 5: Run Tests

```bash
# Run the new tests
npm run test -- [test-file-path]

# Or with coverage
npm run test -- --coverage [test-file-path]
```

## Phase 6: Summary

```markdown
## ✅ Tests Generated

### Created
- `[file].test.tsx` - [N] tests

### Coverage
- Renders correctly
- User interactions
- Edge cases
- Error states

### Run Tests
```bash
npm run test
npm run test:coverage
```

### Next Steps
- [ ] Review generated tests
- [ ] Add more edge cases if needed
- [ ] Set up CI to run tests on PR
```
