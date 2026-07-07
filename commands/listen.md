---
description: Daily social-listening digest with drafted replies (drafts only, never posts)
allowed-tools: Read, Write, Glob, Bash, WebFetch, WebSearch
argument-hint: [optional: extra keyword or subreddit to include today]
---

# Listen: daily digest

Surface the 5 conversations most worth Matt's 15 minutes today, each with a drafted reply. This command NEVER posts anywhere. Reddit and HN ban automated posting; the drafts are raw material Matt rewrites in his own words.

## Step 0: Locate the codex and load voice

<voice>
@marketing-codex/codex/voice.md
</voice>

Read `marketing-codex/codex/keywords.md` if it exists for the current keyword set; otherwise use the defaults below (and create keywords.md from them so future runs are editable):

- Layout: "design system MCP", "claude code design system", "cursor design tokens", "AI generates ugly UI", "figma to code", "DESIGN.md", "shadcn theme"
- Roast: "roast my landing page", "honest feedback SaaS", "testimonial tool", "senja alternative"
- SuperDuperUI: "figma ui kit", "app clone figma", "mobbin alternative"
- Competitors: "Context7", "tweakcn", "21st.dev", "Anima figma", "tokens studio"

Subreddits: r/FigmaDesign, r/webdev, r/SideProject, r/ClaudeAI, r/cursor, r/SaaS. Plus: $ARGUMENTS.

## Step 1: Search (read-only, official/keyless endpoints)

- **HN**: Algolia API, no auth: `curl -s "https://hn.algolia.com/api/v1/search_by_date?query=<term>&tags=(story,comment)&numericFilters=created_at_i><24h-ago-epoch>"`
- **Reddit**: if REDDIT_CLIENT_ID/SECRET are set, use the official API (script auth); otherwise public JSON endpoints politely: `curl -s -A "overheard-digest/1.0 by matt" "https://www.reddit.com/r/<sub>/search.json?q=<term>&restrict_sr=1&sort=new&t=day"` with a 2-second sleep between calls.
- **X**: skip unless explicitly configured (API reads are pay-per-use). Note in the digest that X was not scanned.

Collect threads from the last 24 to 48 hours.

## Step 2: Rank

Score each thread: (a) can Matt genuinely help, independent of any product? (b) is a product mention natural rather than forced? (c) audience size/velocity of the thread, (d) freshness. Discard anything where the only possible reply is promotional. Pick the top 5.

## Step 3: Draft replies

For each: a reply in Matt's voice (voice.md rules: help first, concrete specifics, honest limitations). Product mention ONLY if it genuinely answers the question, and always with a disclosure-friendly framing ("I build Layout, so biased, but..."). Mark 0 to 2 of the five as "product-mention appropriate"; the rest are pure-help replies that build account history.

## Step 4: Write the digest

Write to `marketing-codex/listening/YYYY-MM-DD.md`:
- 5 entries: permalink, one-line context, why it matters, the drafted reply, and a REWRITE-BEFORE-POSTING banner
- Anything notable but not reply-worthy (competitor news, sentiment shifts) as a 3-bullet footer

## Step 5: Report

One line per thread with its permalink. Remind: post manually, rewrite in your own words, never paste two identical replies to different communities.
