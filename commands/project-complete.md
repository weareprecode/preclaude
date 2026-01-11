---
description: Generate end-of-project documentation suite (build journal, features, marketing)
allowed-tools: Read, Write, Bash(git:*), Glob, Grep
model: opus
---

# Project Complete - Generate Documentation Suite

Generate comprehensive documentation for project completion.

## Gather Context

<git_history>
!`git log --oneline -50 2>/dev/null || echo "No git history"`
</git_history>

<recent_files>
!`git diff --stat HEAD~50 2>/dev/null | tail -30 || echo "No changes"`
</recent_files>

<readme>
@README.md
</readme>

<prd>
!`cat docs/prd/*.md 2>/dev/null | head -200 || echo "No PRD found"`
</prd>

## Process

Load and follow the project-complete skill to create ALL documents:

1. **Build Journal** (`docs/public/build-journal.md`)
   - Day-by-day chronicle of the build
   - Decisions made and why
   - Challenges and solutions
   - Technical highlights
   - Make it detailed enough for blog/social content

2. **Feature Documentation** (`docs/public/features.md`)
   - Every feature explained
   - User workflows
   - Screenshots references
   - Technical specs
   - FAQ

3. **Marketing Kit** (`docs/public/marketing-kit.md`)
   - Elevator pitch
   - Brand voice
   - Value propositions
   - Competitive positioning
   - Pitch deck outline

4. **Social Content Pack** (`docs/public/social-content.md`)
   - Twitter/X posts and threads
   - LinkedIn content
   - Product Hunt copy
   - Blog post outlines

5. **Technical Handoff** (`docs/public/technical-handoff.md`)
   - Architecture overview
   - Setup instructions
   - Key decisions
   - Known issues
   - Future considerations

## Create Directory

```bash
mkdir -p docs/public
```

## Output

Generate all 5 documents, then summary:

```markdown
## Documentation Suite Complete ✅

Created in `docs/public/`:
├── build-journal.md     # [N] words - 5-day chronicle
├── features.md          # [N] features documented  
├── marketing-kit.md     # Brand, positioning, pitch
├── social-content.md    # [N] posts ready
└── technical-handoff.md # Dev documentation

### Ready For:
- [ ] Blog: "How We Built [Product] in 5 Days"
- [ ] Twitter: Launch thread
- [ ] LinkedIn: Announcement post
- [ ] Product Hunt: Launch copy

### Next Steps:
1. Add screenshots to feature docs
2. Review/customize brand voice
3. Schedule social posts
```
