---
description: Generate a comprehensive technical PRD for a product or feature MVP
allowed-tools: Read, Write, WebSearch, WebFetch
model: opus
argument-hint: [product-description]
---

# Generate Technical PRD

Use the PRD skill to create a comprehensive Product Requirements Document.

## Gather Inputs

If not provided in $ARGUMENTS, ask for:

1. **Product Description**: What does this product do? What's the core value?
2. **Target Audience**: Who uses this? What's their technical level?
3. **Existing Constraints**: Tech stack, timeline, budget?

## Process

Load and follow the PRD skill methodology exactly:

1. Generate ALL 15 sections (do not skip any)
2. Write 20+ user stories in Gherkin format (DO NOT BE LAZY)
3. Include complete API specifications
4. Define full data model with relationships
5. Cover security, performance, scalability

## Output

Save the PRD to: `docs/prd/[product-name]-prd.md`

## After Completion

Suggest next steps:
```
PRD Complete! Next steps:
1. Review and refine with stakeholders
2. Run /ralph to convert to prd.json for autonomous execution
3. Run /implement to start building
```
