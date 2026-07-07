---
description: Daily social-listening digest with drafted replies (drafts only, never posts)
allowed-tools: Read, Write, Glob, Bash, WebFetch, WebSearch
argument-hint: [optional: extra keyword or subreddit to include today]
---

# Listen: daily digest

Part of the optional **marketing engine** module (see docs/MARKETING-ENGINE.md). Surface the 5 conversations most worth 15 minutes of founder attention today, each with a drafted reply. This command NEVER posts anywhere: Reddit and HN ban automated posting, and the drafts are raw material to be rewritten in the founder's own words.

## Step 0: Locate the codex (hard gate)

Look for `marketing-codex/` in the current workspace or one level up. If missing, STOP and print:
"The marketing engine needs a marketing-codex workspace. See docs/MARKETING-ENGINE.md to scaffold one."

Then Read `marketing-codex/codex/voice.md` (voice rules) and `marketing-codex/codex/keywords.md` (the keyword set and subreddit list). If keywords.md does not exist, STOP and ask the user for their product keywords, competitor names and target subreddits, write keywords.md from their answer, then continue. Include $ARGUMENTS in today's set if given.

## Step 1: Search (read-only, official/keyless endpoints)

- **Hacker News**: Algolia API, no auth: `curl -s "https://hn.algolia.com/api/v1/search_by_date?query=<term>&tags=(story,comment)&numericFilters=created_at_i><24h-ago-epoch>"`
- **Reddit**: if REDDIT_CLIENT_ID/SECRET are set, use the official API (script auth); otherwise public JSON endpoints politely: `curl -s -A "<project>-digest/1.0" "https://www.reddit.com/r/<sub>/search.json?q=<term>&restrict_sr=1&sort=new&t=day"` with a 2-second sleep between calls.
- **X**: skip unless explicitly configured (API reads are pay-per-use). Note in the digest that X was not scanned.

Collect threads from the last 24 to 48 hours.

## Step 2: Rank

Score each thread: (a) can the founder genuinely help, independent of any product? (b) is a product mention natural rather than forced? (c) thread velocity/audience, (d) freshness. Discard anything where the only possible reply is promotional. Pick the top 5.

## Step 3: Draft replies

For each: a reply following voice.md (help first, concrete specifics, honest limitations). Product mention ONLY if it genuinely answers the question, disclosure-framed ("I build <product>, so biased, but..."). Mark at most 2 of the 5 as "product-mention appropriate"; the rest are pure-help replies that build account history.

## Step 4: Write the digest

Write to `marketing-codex/listening/YYYY-MM-DD.md`:
- 5 entries: permalink, one-line context, why it matters, the drafted reply, and a REWRITE-BEFORE-POSTING banner
- Anything notable but not reply-worthy (competitor news, sentiment shifts) as a 3-bullet footer

## Step 5: Report

One line per thread with its permalink. Remind: post manually, rewrite in your own words, never paste identical replies to two communities.
