# The Marketing Engine (optional module)

Five commands — `/demo`, `/atomise`, `/listen`, `/launch`, `/scorecard` — form an optional founder-marketing workflow. They are **not standalone**: they read strategy, voice and config from a `marketing-codex/` workspace that lives in YOUR project folder (usually its own private git repo, since it contains positioning, competitor lines and drafts you would not want public).

Without a codex, each command stops at Step 0 with a pointer here. Nothing in the module ever publishes, posts or sends anything: every output is a draft for human approval. That is a design contract, not a limitation.

## The weekly loop these support

1. **Monday:** `/demo` records a real product demo → you voice it → `/atomise` turns it into the week's platform drafts
2. **Daily (15 min):** `/listen` digests the conversations worth joining, with drafted replies you rewrite and post yourself
3. **Every 4-6 weeks:** `/launch` generates a full launch-episode pack (Show HN, directories, social, email)
4. **Weekly:** `/scorecard` pulls analytics and writes the numbers report with recommendations

## Scaffold your own codex

```
marketing-codex/
  codex/
    voice.md        # how you sound + hard posting caps (max posts/day, value-to-ask ratio)
    audience.md     # who you are talking to, per product
    funnel.md       # how your products cross-promote; UTM rules
    keywords.md     # listening keywords, competitor names, subreddits
    config.md       # analytics provider/base URL/token env, tracked sites, npm packages
  products/
    <product>.md    # one-pager: ICP, pain, promise, proof, CTA, banned claims
  pillars/          # raw material in (notes.md + demo video), atomised content out
  launches/
    checklist.md    # your reusable launch playbook
  scorecard/
    targets.md      # baselines and targets
    weekly/         # generated reports
  listening/        # generated digests
```

Start minimal: `voice.md`, one product one-pager and `config.md` are enough for every command to run. The commands offer to create `keywords.md`, `targets.md` and a starter `checklist.md` interactively when missing.

## Recommended guardrails

- Keep the codex in a **private** repo; the strategy lives there, not in Preclaude.
- Posting caps belong in `voice.md` so every tool enforces them (e.g. max one original post per platform per day, four value posts per ask).
- If you wire a posting rail (Publer, Typefully...), drafts only: a human presses publish. Consider a PreToolUse hook that blocks direct social-platform API calls.
- Automation (scheduled digests, weekly scorecard via CI) works well on top — add a weekly watchdog job, because a silently dead cron looks identical to "nothing happened this week".
