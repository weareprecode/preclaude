---
description: Generate a codex-grounded UGC/product video ad via Higgsfield, saved as a pillar for /atomise
allowed-tools: Read, Write, Glob, Grep, Bash, WebFetch
argument-hint: [product key from marketing-codex/products/, e.g. layout | roast | superduperui — optional, prompts if omitted]
---

# UGC video ad: $ARGUMENTS

Part of the optional **marketing engine** module (see docs/MARKETING-ENGINE.md). Generates a short marketing video through the Higgsfield CLI for a product chosen from the marketing codex. The brief is derived from the product one-pager and constrained by its banned-claims section plus voice.md. It shows the credit cost and waits for explicit confirmation before any paid call. Output is a pillar folder for /atomise. Nothing is posted.

**Read this first — the honest default.** Research (marketing-codex/automation/ugc-research.md) found that synthetic-avatar "presenter/testimonial" UGC is a net brand risk for all three flagships and, from 2 Aug 2026, an EU AI Act disclosure liability. So this command defaults to **product-showcase / screen-driven video with NO synthetic presenter**, surfaces a per-product suitability verdict before spending, and never fabricates a "real customer". For Layout specifically, prefer `/demo` (real screen capture). Treat `/ugc` as the Roast/SuperDuperUI tool, used deliberately.

## Step 0 — Two hard gates (STOP on fail)

**0a. Locate the codex.** Look for `marketing-codex/` in the current workspace or one level up. If missing, STOP and print:
"The marketing engine needs a marketing-codex workspace. See docs/MARKETING-ENGINE.md to scaffold one."
Then Read as hard constraints: `marketing-codex/codex/voice.md`, `marketing-codex/codex/config.md`.

**0b. Higgsfield bootstrap.**
```bash
command -v higgsfield >/dev/null 2>&1 || { echo "Higgsfield CLI not installed: curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh"; exit 1; }
higgsfield account status
```
If it reports `Session expired` / `Not authenticated`, STOP and tell the user to run `higgsfield auth login` (interactive) then re-run. Never attempt `auth login` non-interactively.

## Step 1 — Product selection

If `$ARGUMENTS` matches a file in `marketing-codex/products/`, use it. Otherwise Glob `marketing-codex/products/*.md`, read each `## One-line`, present a one-liner menu, ask the user to pick one (one question). Read the chosen `products/<product>.md` in full — it is now the single source of truth.

## Step 2 — Suitability gate (surface the verdict BEFORE spending)

Read the chosen one-pager's `## UGC suitability` line (added to each one-pager; if absent, fall back to the table in `marketing-codex/automation/ugc-research.md`). Print it plainly and let the user proceed or abort:
- **layout** — Weak fit. Developer audiences reject AI-presenter ads and it contradicts the anti-generic-AI brand. Recommend `/demo` instead. Only proceed as a labelled `experimental` product-showcase, never an avatar testimonial.
- **superduperui** — Low fit / highest brand risk. Designers are the most AI-slop-hostile audience and the product sells human craft. Prefer a `product_showcase` of real Figma files with no presenter; discourage avatar UGC.
- **roast** — Moderate fit, one hard rule: never a synthetic "user" praising Roast (self-refuting for a truth-in-feedback product, and a fabricated-testimonial breach of its banned-claims). Use it to cut real proof (payout screenshots, real roasts), not to fake a person.

If the user aborts, STOP cleanly (nothing spent). If they proceed, continue.

## Step 3 — Resolve the live URL and register as a webproduct

URL comes from `config.md` tracked sites mapped to the product (layout → layout.design, roast → roastnow.com, superduperui → superduperui.com), cross-checked against the one-pager. Normalise to `https://<domain>`; optionally WebFetch to confirm it responds.

SaaS sites are **webproducts** (not physical `products`):
```bash
WEBPRODUCT_ID=$(higgsfield marketing-studio webproducts fetch --url "https://<domain>" --wait --json | jq -r '.id // empty')
```
If it fails / scrape-blocked (empty id or `fail_reason`), fall back to a codex-grounded manual create (title/subtitle/description from the one-pager, banned-claims-scrubbed; favicon/screenshots must be URLs):
```bash
WEBPRODUCT_ID=$(higgsfield marketing-studio webproducts create --url "https://<domain>" \
  --title "<display name>" --subtitle "<one-pager short line>" --description "<promise, trimmed & scrubbed>" \
  --favicon-url "https://<domain>/favicon.ico" --json | jq -r '.id')
```

## Step 4 — Assemble the brief from the one-pager (the differentiator)

Derive angle from `## Promise`/`## Pain`, CTA verbatim from `## CTA`. Then apply as HARD filters, in order:
1. The one-pager's `## Banned claims` (absolute — no fabricated traction, no named-company "uses in production", never lead with testimonials for Roast, no invented endorsements for SuperDuperUI).
2. `voice.md` (UK English, no em dashes, no hype adjectives, no "look what I built", no unsourced numbers).
3. Spoken-word reality: a 15s clip is ~35-40 words; one idea; concrete; honest-limitation is on-brand.

Produce one `--prompt` string (spoken brief + scene direction) and a `--mode`. **Show the assembled prompt to the user for approval or edit before generating.** This is where the codex earns its keep — surface it.

## Step 5 — Choices (default to no synthetic presenter)

One question per phase, codex-derived defaults:
1. **Mode** (`--mode`): default `product_showcase` (no presenter). Only offer `ugc`/`product_review`/`ugc_unboxing` if the user explicitly wants a presenter and the suitability gate allowed it. Full slugs in `references/marketing-modes.md`; hooks/settings valid only for `ugc, ugc_how_to, ugc_unboxing, product_review, ugc_virtual_try_on`.
2. **Avatar** (`--avatars`): **default OMIT.** Only attach on explicit request. Never present a synthesised avatar as a real customer. A custom founder avatar needs Matt's explicit opt-in (likeness).
3. **Hook/setting** (optional, presenter modes only): default none — the codex prompt carries the angle.
4. **Format:** `--aspect_ratio 9:16` (or 16:9 for LinkedIn), `--duration 15`, `--resolution 720p`, `--generate_audio true`.

## Step 6 — Cost gate (hard stop before any paid call)

Preview cost with the no-charge estimator, then require explicit confirmation. (SaaS 15s/720p ≈ 81 credits.)
```bash
# No-charge estimate. If `generate cost` is unavailable, try `--cost-only`; the GATE HOLDS regardless of syntax.
higgsfield generate cost marketing_studio_video \
  --specific_mode web_product --web_product_ids @"$WEB_IDS_JSON" \
  --mode <mode> --duration 15 --resolution 720p --aspect_ratio 9:16 --generate_audio true
```
Print the cost in plain language and ask: "This will spend N credits. Generate now? (yes/no)". Proceed only on an explicit **yes**. Never spin up multiple variants unless asked (each is a paid call).

## Step 7 — Generate (paid, only after yes)

```bash
WEB_IDS_JSON=$(mktemp); printf '["%s"]' "$WEBPRODUCT_ID" > "$WEB_IDS_JSON"
# AVATARS_JSON only if a presenter was explicitly chosen:
# AVATARS_JSON=$(mktemp); printf '[{"id":"%s","type":"preset"}]' "$AVATAR_ID" > "$AVATARS_JSON"

higgsfield generate create marketing_studio_video \
  --prompt "<assembled prompt>" \
  --specific_mode web_product --web_product_ids @"$WEB_IDS_JSON" \
  --mode <mode> --duration 15 --resolution 720p --aspect_ratio 9:16 --generate_audio true \
  [--avatars @"$AVATARS_JSON"] [--hook_id <id>] [--setting_id <id>] \
  --wait --wait-timeout 30m --json
```
Extract the media URL from the payload (confirm the jq path against the real payload; fall back to the human-readable stdout URL). On failure, report `fail_reason` plainly and STOP — do not retry (each retry costs credits).

## Step 8 — Save as a pillar (draft only, /atomise-compatible)

Create `marketing-codex/pillars/YYYY-MM-DD-<product>-ugc/` (suffix -2 if exists). Write `notes.md`:
```markdown
# Pillar notes: <product> video ad (Higgsfield, <mode>)

Product: <product>
Source: /ugc (Higgsfield marketing_studio_video) — AI-GENERATED
Generated: <YYYY-MM-DD>
Suitability: <verdict from Step 2>

## The asset
- Video URL: <url>   ·   Local: <ugc.mp4 if downloaded>
- Mode/duration/aspect/audio · Avatar: <none | ...> · Job id · Credits spent: <N>

## The brief (codex-grounded)
- Angle (traced to Promise/Pain): <...>   ·   CTA (verbatim): <...>   ·   Prompt used: <...>

## The one insight
<the single idea — feeds /atomise>

## Honest limitation
<what it does not claim / where an AI asset is thin>

## Compliance (AI-generated content)
- This is AI-generated. If used in PAID ads or EU-facing distribution, it needs a visible AI-disclosure
  and (EU AI Act Art. 50, in force 2 Aug 2026) a machine-readable watermark. FTC disclosure applies in the US.
  Never present it as a real customer testimonial.

## Provenance / banned-claims check
- Every line traces to products/<product>.md. Banned-claims + voice.md scrub: <pass, note anything cut>.
```
Offer to download for /atomise clip-cutting: `curl -fsSL "<url>" -o "marketing-codex/pillars/<folder>/ugc.mp4"`.

## Step 9 — Optional Virality Predictor (second paid call — offer, don't auto-run)
```bash
higgsfield generate create brain_activity --video "marketing-codex/pillars/<folder>/ugc.mp4" --wait
```
Append the concise scores + report URL to notes.md under `## Virality Predictor`. Frame as a testing signal, not a guarantee.

## Step 10 — Report
Print: the video URL (not JSON), pillar path, credits spent, the suitability caution if flagged, and:
"Draft only, nothing posted. AI-generated — needs disclosure if used in paid/EU ads. Run `/atomise YYYY-MM-DD-<product>-ugc` to turn it into posts for review."
