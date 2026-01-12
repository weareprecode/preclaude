---
description: Generate stakeholder update pack - daily/weekly progress reports with metrics
allowed-tools: Read, Write, Bash, Glob, Grep
model: opus
argument-hint: [daily|weekly|pack]
---

# Stakeholder Update

Generate progress updates for stakeholders - daily standup notes, weekly reports, or full update packs.

## Phase 1: Determine Update Type

If $ARGUMENTS provided, use that. Otherwise, ask:

Use AskUserQuestion tool:
```json
{
  "questions": [{
    "question": "What type of update do you need?",
    "header": "Update",
    "options": [
      {"label": "Daily update", "description": "Quick standup-style summary of today's progress"},
      {"label": "Weekly report", "description": "Full week summary with metrics and next steps"},
      {"label": "Full pack", "description": "Comprehensive stakeholder pack with screenshots and demos"}
    ],
    "multiSelect": false
  }]
}
```

## Phase 2: Gather Data

### Git Activity
```bash
# Commits today
git log --oneline --since="midnight" --author="$(git config user.name)" 2>/dev/null | head -10

# Commits this week
git log --oneline --since="1 week ago" --author="$(git config user.name)" 2>/dev/null | head -20

# Files changed this week
git diff --stat --since="1 week ago" HEAD 2>/dev/null | tail -1
```

### Project Status
```bash
# Check for PRD/stories
find . -name "prd.json" -path "*/ralph/*" 2>/dev/null | head -1

# If found, get story progress
cat scripts/ralph/prd.json 2>/dev/null | jq '{
  total: (.userStories | length),
  completed: ([.userStories[] | select(.passes == true)] | length),
  remaining: ([.userStories[] | select(.passes == false)] | length)
}' 2>/dev/null
```

### Recent Handoffs
```bash
# Find recent handoff notes
find . -name "*handoff*" -type f 2>/dev/null | grep -v node_modules | head -3
```

## Phase 3: Generate Updates

### Daily Update Template

```markdown
# Daily Update - [Date]

## ✅ Completed Today
- [Completed item 1]
- [Completed item 2]
- [Completed item 3]

## 🔄 In Progress
- [In progress item] - [% complete or blocker]

## 🎯 Tomorrow's Focus
- [Priority 1]
- [Priority 2]

## 🚧 Blockers
- [Blocker if any, or "None"]

---
**Commits**: [N] | **Stories**: [X/Y] complete
```

### Weekly Report Template

```markdown
# Weekly Progress Report
**Week of**: [Start Date] - [End Date]
**Project**: [Project Name]

---

## 📊 Summary

| Metric | This Week | Total |
|--------|-----------|-------|
| Stories Completed | [N] | [X/Y] |
| Commits | [N] | [Total] |
| PRs Merged | [N] | [Total] |
| Bugs Fixed | [N] | - |

## ✅ Completed This Week

### Features
- **[Feature 1]**: [Brief description]
- **[Feature 2]**: [Brief description]

### Improvements
- [Improvement 1]
- [Improvement 2]

### Bug Fixes
- Fixed [bug description]

## 📸 Screenshots / Demos

[Include key screenshots of new features]

| Feature | Screenshot |
|---------|------------|
| [Feature] | [path or embed] |

## 🔄 In Progress

| Task | Status | ETA |
|------|--------|-----|
| [Task 1] | 80% | [Date] |
| [Task 2] | 50% | [Date] |

## 📅 Next Week's Plan

### Priority 1 (Must Do)
- [ ] [Task]
- [ ] [Task]

### Priority 2 (Should Do)
- [ ] [Task]

### Priority 3 (Nice to Have)
- [ ] [Task]

## 🚧 Risks & Blockers

| Risk/Blocker | Impact | Mitigation |
|--------------|--------|------------|
| [Issue] | [High/Med/Low] | [Action] |

## 💡 Decisions Needed

- [ ] [Decision 1]: [Options A, B, C]
- [ ] [Decision 2]: [Options]

---

**Next Update**: [Date]
```

### Full Stakeholder Pack Template

```markdown
# Stakeholder Update Pack
**Project**: [Project Name]
**Date**: [Date]
**Prepared by**: [Name]

---

## 🎯 Executive Summary

[2-3 sentence overview of project status, key achievements, and any concerns]

**Overall Status**: 🟢 On Track / 🟡 At Risk / 🔴 Blocked

---

## 📈 Progress Overview

### Sprint/Phase Progress
```
[▓▓▓▓▓▓▓▓░░░░░░░░░░░░] 40% Complete
```

### Key Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Features Complete | [N] | [N] | 🟢/🟡/🔴 |
| Stories Done | [N] | [X/Y] | 🟢/🟡/🔴 |
| Test Coverage | 80% | [N]% | 🟢/🟡/🔴 |
| Performance (LCP) | <2.5s | [N]s | 🟢/🟡/🔴 |

---

## ✅ Achievements This Period

### Major Milestones
1. **[Milestone 1]** ✅
   - [What was delivered]
   - [Business value]

2. **[Milestone 2]** ✅
   - [What was delivered]
   - [Business value]

### Features Delivered

| Feature | Description | Demo |
|---------|-------------|------|
| [Feature 1] | [Brief description] | [Link/Screenshot] |
| [Feature 2] | [Brief description] | [Link/Screenshot] |

---

## 📸 Visual Progress

### Before & After
[Include comparison screenshots if applicable]

### New Features
[Screenshots of key new features with annotations]

### Demo Links
- **Staging**: [URL]
- **Feature Preview**: [URL]

---

## 🗓️ Timeline

### Completed
- [x] [Date] - [Milestone]
- [x] [Date] - [Milestone]

### Upcoming
- [ ] [Date] - [Milestone]
- [ ] [Date] - [Milestone]
- [ ] [Date] - **Launch** 🚀

---

## 💰 Budget & Resources

| Item | Budget | Spent | Remaining |
|------|--------|-------|-----------|
| Development | [Amount] | [Amount] | [Amount] |
| Infrastructure | [Amount] | [Amount] | [Amount] |
| **Total** | [Amount] | [Amount] | [Amount] |

---

## ⚠️ Risks & Issues

### Current Risks

| # | Risk | Probability | Impact | Mitigation | Owner |
|---|------|-------------|--------|------------|-------|
| 1 | [Risk] | High/Med/Low | High/Med/Low | [Action] | [Name] |

### Open Issues

| # | Issue | Priority | Status | ETA |
|---|-------|----------|--------|-----|
| 1 | [Issue] | P1/P2/P3 | In Progress | [Date] |

---

## ❓ Decisions Required

| # | Decision | Options | Recommendation | Deadline |
|---|----------|---------|----------------|----------|
| 1 | [Decision needed] | A, B, C | [Recommendation] | [Date] |

---

## 📋 Next Steps

### Immediate (This Week)
1. [Action item]
2. [Action item]

### Short Term (Next 2 Weeks)
1. [Action item]
2. [Action item]

### Dependencies on Stakeholders
- [ ] [What's needed from stakeholders]

---

## 📞 Questions?

Contact: [Name] - [Email/Slack]

---

*Generated with Claude Code /stakeholder command*
```

## Phase 4: Save Report

Save to `docs/updates/`:

```bash
mkdir -p docs/updates
```

**Daily**: `docs/updates/daily-YYYY-MM-DD.md`
**Weekly**: `docs/updates/weekly-YYYY-WXX.md`
**Pack**: `docs/updates/stakeholder-pack-YYYY-MM-DD.md`

## Phase 5: Output

```markdown
## ✅ Update Generated

**Type**: [Daily/Weekly/Pack]
**Saved to**: `docs/updates/[filename].md`

### Quick Stats
- Stories: [X/Y] complete
- Commits this period: [N]
- Key achievement: [Main accomplishment]

### Share
Copy the markdown above or share the file directly with stakeholders.
```
