---
description: Weekly marketing scorecard from Plausible + npm, with 3 recommendations
allowed-tools: Read, Write, Glob, Bash
argument-hint: [optional: ISO week to regenerate, defaults to current]
---

# Scorecard: week $ARGUMENTS

Pull the numbers, compare against targets, write the weekly scorecard. Read-only against all APIs; writes one markdown file.

## Step 0: Config

Env needed: `PLAUSIBLE_API_TOKEN` (Stats API key from analytics.unified.studio → Settings → API Keys). Base URL: `https://analytics.unified.studio`. Sites: layout.design, superduperui.com, roastnow.com, precode.co, waitstack.co.

If the token is missing, STOP and print the one-paragraph instruction for creating it (requires Plausible CE v3.x; if the API 404s, point to `marketing-codex/automation/plausible-upgrade.md`).

Read targets from `marketing-codex/scorecard/targets.md` (create from MARKETING-MASTER-PLAN.md §1 if missing).

## Step 1: Pull data (per site, this week vs last week vs 4-week average)

```bash
curl -s -X POST https://analytics.unified.studio/api/v2/query \
  -H "Authorization: Bearer $PLAUSIBLE_API_TOKEN" -H "Content-Type: application/json" \
  -d '{"site_id":"<site>","metrics":["visitors","visits","pageviews","bounce_rate"],"date_range":"7d","dimensions":[]}'
```
Repeat with `"dimensions":["visit:source"]` (top 5 sources) and `["event:page"]` (top 5 pages). Also:
- npm downloads: `curl -s https://api.npmjs.org/downloads/point/last-week/@layoutdesign/context`
- AI referrals: filter sources for chatgpt.com, claude.ai, perplexity.ai, gemini.google.com
- UTM check: query `visit:utm_medium` — flag if studio-footer/organic tags are absent (means untagged links are leaking)

If any API call fails, the scorecard still generates with that section marked DATA MISSING and a loud banner at the top.

## Step 2: Write `marketing-codex/scorecard/weekly/YYYY-WW.md`

- Headline table: per-site visitors (this week / last week / 4-wk avg / 90-day target from targets.md)
- Published-units count: `grep -rl "scheduled-for: <this-week>" marketing-codex/pillars/*/outputs/ | wc -l` plus listening-digest reply count (Matt logs posted replies by ticking them in the digest files; count ticked)
- AI-referral and top-source movements worth knowing
- **Three recommendations**, each tied to a number ("Layout's HN referrals died Tuesday: the README quickstart 404s, fix before next post"), never generic advice
- One **keep/kill candidate** for Friday's human decision

## Step 3: Report

Print the headline table and the three recommendations. Do not email or post anything.
