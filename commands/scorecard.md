---
description: Weekly marketing scorecard from analytics with data-tied recommendations
allowed-tools: Read, Write, Glob, Bash
argument-hint: [optional: ISO week to regenerate, defaults to current]
---

# Scorecard: week $ARGUMENTS

Part of the optional **marketing engine** module (see docs/MARKETING-ENGINE.md). Pull the numbers, compare against targets, write the weekly scorecard. Read-only against all APIs; writes one markdown file.

## Step 0: Locate the codex and config (hard gate)

Look for `marketing-codex/` in the current workspace or one level up. If missing, STOP and print:
"The marketing engine needs a marketing-codex workspace. See docs/MARKETING-ENGINE.md to scaffold one."

Read `marketing-codex/codex/config.md` for: analytics provider + base_url, the token env var name, tracked sites, npm packages to track, and AI referrers to segment. If config.md is missing, STOP and ask for those values, write config.md, then continue.

Check the analytics token env var named in config.md is set. If not, STOP and print how to create it (for Plausible: Settings → API Keys → Stats API; requires Plausible v3+ if self-hosted CE).

Read targets from `marketing-codex/scorecard/targets.md`; if missing, create a skeleton from the current week's numbers as baseline and say so.

## Step 1: Pull data (per tracked site: this week vs last week vs 4-week average)

For Plausible (adapt if config names another provider):
```bash
curl -s -X POST <base_url>/api/v2/query \
  -H "Authorization: Bearer $<TOKEN_ENV>" -H "Content-Type: application/json" \
  -d '{"site_id":"<site>","metrics":["visitors","visits","pageviews","bounce_rate"],"date_range":"7d","dimensions":[]}'
```
Repeat with `"dimensions":["visit:source"]` (top 5) and `["event:page"]` (top 5). Also:
- npm weekly downloads for each package in config: `curl -s https://api.npmjs.org/downloads/point/last-week/<package>`
- AI referrals: filter sources for the referrers listed in config
- UTM check: query `visit:utm_medium`; flag if the codex's expected tags are absent (untagged links leaking)

If any API call fails, still generate the scorecard with that section marked DATA MISSING and a loud banner at the top.

## Step 2: Write `marketing-codex/scorecard/weekly/YYYY-WW.md`

- Headline table: per-site visitors (this week / last week / 4-wk avg / target)
- Published-units count: `grep -rl "scheduled-for: <this-week>" marketing-codex/pillars/*/outputs/ 2>/dev/null | wc -l` plus ticked replies in this week's listening digests
- Source movements worth knowing, AI referrals separately
- **Three recommendations**, each tied to a number, never generic advice
- One **keep/kill candidate** for the weekly human decision

## Step 3: Report

Print the headline table and the three recommendations. Do not email or post anything.
