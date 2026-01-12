---
description: Polish UI to match a design reference - URL, Figma, or screenshot
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, mcp__figma__get_figma_data, mcp__figma__download_figma_images, AskUserQuestion
model: opus
argument-hint: [component-or-page]
---

# Polish UI

Refine and polish UI components or pages to match a design reference.

## Phase 1: Gather Requirements

### Question 1: What to Polish

If $ARGUMENTS provided, use that as target.
Otherwise, use AskUserQuestion:

```json
{
  "questions": [{
    "question": "What would you like to polish?",
    "header": "Target",
    "options": [
      {"label": "Specific component", "description": "A single component that needs refinement"},
      {"label": "Entire page", "description": "Polish a full page layout"},
      {"label": "Multiple components", "description": "Several related components"},
      {"label": "Global styles", "description": "Typography, spacing, colours across the app"}
    ],
    "multiSelect": false
  }]
}
```

Then ask user to specify the file path or component name.

### Question 2: Design Reference

Use AskUserQuestion:

```json
{
  "questions": [{
    "question": "Do you have a design reference to match?",
    "header": "Reference",
    "options": [
      {"label": "URL", "description": "Website URL to extract design patterns from"},
      {"label": "Figma", "description": "Figma file URL with the design"},
      {"label": "Screenshot", "description": "Screenshot image file path"},
      {"label": "No reference", "description": "Just improve based on best practices"}
    ],
    "multiSelect": false
  }]
}
```

## Phase 2: Extract Design System

### If URL Selected

Use WebFetch to analyse the reference site:

```
Extract the following design tokens from this page:
- Colour palette (primary, secondary, accent, neutral colours with hex values)
- Typography (font families, sizes, weights, line heights)
- Spacing system (padding, margins, gaps)
- Border radius values
- Shadow styles
- Animation/transition patterns
- Button styles
- Card styles
- Any distinctive visual patterns
```

### If Figma Selected

Use mcp__figma__get_figma_data to fetch design:

1. Extract fileKey from URL (e.g., `figma.com/design/ABC123/...` → `ABC123`)
2. Extract nodeId if provided in URL (e.g., `node-id=1234:5678`)
3. Fetch design data and extract:
   - Colour styles
   - Text styles
   - Effects (shadows, blurs)
   - Component variants
   - Auto-layout spacing values

Use mcp__figma__download_figma_images if icons or images needed.

### If Screenshot Selected

Read the screenshot file and analyse:
- Dominant colours
- Typography characteristics
- Layout patterns
- Component styles
- Spacing relationships

### If No Reference

Apply modern UI best practices:
- Consistent spacing (4px/8px grid)
- Proper visual hierarchy
- Accessible colour contrast
- Smooth micro-interactions
- Clean typography scale

## Phase 3: Analyse Current Code

Read the target file(s) and identify:

```bash
# Find the target file
find . -name "*[component-name]*" -type f 2>/dev/null | grep -v node_modules | head -10
```

Analyse current implementation:
- Current styling approach (Tailwind, CSS modules, styled-components)
- Existing colour usage
- Typography styles
- Spacing values
- Animation/transitions
- Component structure

## Phase 4: Create Polish Plan

Compare current vs reference and identify gaps:

```markdown
## Polish Plan

### Colours
| Current | Reference | Change |
|---------|-----------|--------|
| #3b82f6 | #0066FF   | Update primary blue |
| #f3f4f6 | #FAFAFA   | Lighter background |

### Typography
- [ ] Update heading font-weight from 600 to 700
- [ ] Increase body line-height from 1.5 to 1.6
- [ ] Add letter-spacing to headings

### Spacing
- [ ] Increase card padding from p-4 to p-6
- [ ] Add consistent gap-6 between sections
- [ ] Increase button padding

### Effects
- [ ] Add subtle shadow to cards
- [ ] Smooth hover transitions (200ms)
- [ ] Add focus ring styles

### Components
- [ ] Round button corners (rounded-xl)
- [ ] Add hover state animations
- [ ] Improve input field styling
```

## Phase 5: Apply Polish

Make the changes systematically:

1. **Update colour tokens** (if using CSS variables or Tailwind config)
2. **Apply typography changes**
3. **Fix spacing inconsistencies**
4. **Add/improve shadows and effects**
5. **Enhance hover/focus states**
6. **Add micro-interactions**

### Common Polish Patterns

**Better Buttons**
```tsx
// Before
<button className="bg-blue-500 text-white px-4 py-2 rounded">

// After
<button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium
  hover:bg-blue-700 active:scale-[0.98] transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
```

**Better Cards**
```tsx
// Before
<div className="border p-4 rounded">

// After
<div className="bg-white border border-gray-100 p-6 rounded-2xl
  shadow-sm hover:shadow-md transition-shadow duration-200">
```

**Better Inputs**
```tsx
// Before
<input className="border p-2 rounded">

// After
<input className="w-full px-4 py-3 rounded-xl border border-gray-200
  bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2
  focus:ring-blue-500/20 transition-all duration-200 outline-none">
```

**Smooth Transitions**
```tsx
// Add to interactive elements
className="transition-all duration-200 ease-out"

// Hover lift effect
className="hover:-translate-y-0.5 hover:shadow-lg"

// Active press effect
className="active:scale-[0.98]"
```

## Phase 6: Verify Changes

```bash
# Run dev server to check changes
npm run dev

# Run typecheck
npm run typecheck

# Run lint
npm run lint
```

## Phase 7: Summary

```markdown
## ✨ Polish Complete

### Changes Applied
- **Colours**: Updated primary palette to match reference
- **Typography**: Improved heading weights and line-heights
- **Spacing**: Consistent 8px grid system applied
- **Effects**: Added shadows and smooth transitions
- **Interactions**: Enhanced hover and focus states

### Files Modified
- `src/components/Button.tsx`
- `src/components/Card.tsx`
- `tailwind.config.ts`

### Before/After
[Describe key visual improvements]

### Next Steps
- [ ] Review changes in browser
- [ ] Test on mobile viewport
- [ ] Check dark mode (if applicable)
- [ ] Verify accessibility (contrast ratios)
```
