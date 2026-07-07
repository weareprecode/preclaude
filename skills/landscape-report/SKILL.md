# Landscape Report - Competitive Viability Assessment

## Purpose
Run a deep, brutally honest competitive-landscape and viability assessment of an EXISTING product, then publish the findings as a polished, shareable website report. Answers: is this product still viable, what is the USP that survives fact-checking, what is the biggest threat, what should we concentrate on, and should we carry on.

Distinct from `/research`, which validates a NEW idea before building. This skill audits a product you already ship, against a market that has moved.

## When to Invoke
- `/landscape` - Assess this product's competitive position
- "Is this product still viable given [competitor/platform update]?"
- "What's our biggest USP / biggest threat?"
- "Should we carry on with this?"
- "Do a competitive landscape review and give me a report"
- After a major platform event (competitor launch, incumbent conference) that may have changed the market

---

## Process

### Phase 0: Ground in the product (do NOT skip)
Read before any web research: project `CLAUDE.md`, `README`, memory files, and any prior competitive analyses. Produce a short CONTEXT block: what the product is, who it's for, every claimed moat/USP (verbatim), business stage (pre-launch/revenue), team size, and today's date. Every research agent receives this block. Prior analyses set the date cutoff (prioritise developments SINCE the last one); with no prior analysis, default to the last 12 months. If no moats are written down anywhere, infer them from positioning copy, label them "(inferred)" in the CONTEXT block, and confirm with the user if they're available. If the invocation carried an argument (e.g. "given X's new launch"), treat it as the trigger event: dedicate one research agent to it directly and weight everything since it.

### Phase 1: Parallel research sweep (6-8 agents)
Use a Workflow if multi-agent orchestration is available/opted-in; otherwise launch parallel Agent calls in a single message. One agent per dimension, chosen from:

1. **Platform incumbent moves** - what did the dominant platform in this space ship recently (conferences, changelogs, pricing, API/rate-limit changes)?
2. **Direct competitor deep-dive** - the single scariest competitor, examined properly
3. **Standards/format wars** - is an open standard or big-tech format absorbing the category?
4. **Adjacent generators/absorbers** - are bigger tools bolting on this product's core feature natively?
5. **Same-niche entrants** - who else does exactly this, incl. OSS clones on GitHub/npm
6. **Demand-side evidence** - surveys, reports, community discourse: is the pain growing, named, unsolved?
7. **Willingness-to-pay** - what do comparable tools actually charge and earn? Who pays: indies or teams? Any shutdowns (autopsy them)?
8. **Distribution + exit reality** - marketplace/storefront mechanics for a company this size; buy-vs-build behaviour of likely acquirers

Merge, drop, or invent dimensions to fit the product - aim for 6-8 total, no overlap. Use an agent type that has WebSearch/WebFetch. Every agent prompt must include: the CONTEXT block (incl. today's date); "use WebSearch/WebFetch extensively (10+ searches, fetch primary sources)"; "DATE every claim"; "distinguish shipped vs announced vs rumoured"; "note what you could NOT confirm"; and "for each finding, state impact on [product]: threat/opportunity/neutral and why - be brutally honest, if something guts a claimed moat, say so plainly". For paywalled data (revenue, WTP), try Indie Hackers posts, acquisition announcements, archive.org pricing-page history.

### Phase 2: Adversarial passes (3 agents, after Phase 1)
Condense Phase 1 into a digest that preserves every dated claim and impact tag (drop prose, keep evidence). Run all three in parallel on that digest; bear and bull may run their own verification searches on any claim they lean on:
- **Bear case** - ruthless sceptic: strongest honest case to stop or pivot hard. Attack each claimed moat specifically. No strawmen - must survive fact-checking.
- **Bull case** - strongest honest case grounded in where incumbents structurally CANNOT go (business-model conflicts). Must name what to kill - a bull case defending everything equally is not credible.
- **Completeness critic** - up to 4 SPECIFIC researchable questions missing that would change the go/no-go answer.

### Phase 3: Gap fill
Run follow-up research agents on the critic's questions. **Check every agent's output from ALL phases is substantive** - agents sometimes return stub/empty results ("test", one-liner). Re-run any that did (once; if it stubs again, list the question as open in the report footer). Never publish a report with silently missing sections.

### Phase 4: Synthesise + publish the website report
Load the artifact-design skill FIRST, then build a self-contained HTML report:
- **Verdict stamp** at top (e.g. "CARRY ON - conditional: pivot the wedge") with a one-paragraph justification
- **Moat scorecard** - each claimed moat graded holds / eroding / gutted, with evidence
- **Biggest USP** - the one sentence to own, and why incumbents structurally can't copy it
- **Ranked threats** with severity tags
- **Key stats** pulled from findings (small stat tiles)
- **Portfolio triage** (keep / demote / cut) if multi-product
- **What to concentrate on** - a phased 6-month plan
- **Go/no-go verdict** - one of CARRY ON / PIVOT / STOP (optionally "- conditional: ..."), plus the condition under which the bear wins and the path where the bull wins
- **Footer**: dated sources, confidence per area (high/medium/low), anything unverified or still open

Publish as an Artifact (private to the user by default). **Only deploy publicly if the user asked for a shareable/public link** - this is a candid internal assessment. If they did and a Vercel CLI is authenticated (`npx vercel whoami`), wrap as standalone `index.html` (add doctype/head/meta - artifacts omit them) in a scratch folder and `npx vercel deploy --prod --yes --name <product>-situation-report`, then verify HTTP 200 AND that report content is actually served before handing over.

### Phase 5: Persist
Save the verdict + key findings + report URL(s) to file-based project memory. Supersede any older landscape memory: update it in place or mark it historical with a pointer to the new one - never leave two "current" verdicts. Announce completion with all report URLs.

## Rules
- **Brutal honesty is the deliverable.** The user is asking whether to keep building. Flattery is a disservice.
- **Scale to the ask.** Full run ≈ 13-15 web-research agents. For a lighter "quick check", cut to 4 research dimensions + bear/bull (skip critic/gap-fill) and say what was skipped.
- Marketing copy is not evidence - prefer changelogs, docs, pricing pages, benchmarks, post-mortems.
- Undated claims are weak claims. Unverifiable numbers get flagged as unverified.
- The bear case and bull case must BOTH be strong; the verdict reconciles them, it doesn't pick a side by temperament.

## Common Mistakes
- Skipping Phase 0 and researching a strawman of the product
- Only researching competitors and ignoring willingness-to-pay and distribution (these flip verdicts)
- Accepting agent stub outputs without re-running them
- A report that hedges everywhere - the verdict must be usable
