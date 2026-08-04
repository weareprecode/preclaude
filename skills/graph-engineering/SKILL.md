---
name: graph-engineering
description: Turns any messy AI workflow into a managed agent graph — a planner splits the question, parallel lanes work independently, a skeptic attacks the evidence, a merger synthesises survivors, and a human gate sits where mistakes get expensive, with a file paper trail that compounds across runs. Use when running /graph, when asked to "turn this into a workflow", "run this as a graph", "split this into parallel research", or when a one-shot AI answer is about to drive an expensive decision.
---

# Graph Engineering - Design the Work Around the AI

## Purpose

Prompt engineering is asking a better question. Context engineering is giving better information. Graph engineering is designing the work around the AI so it stops living inside one giant chat: jobs connected by arrows, with shared state moving between them.

The failure mode this prevents: one model, in one pass, decides what matters, does the research, interprets the evidence, writes the recommendation, AND grades its own confidence. That's too much trust in one blob of text — especially when the answer drives a decision that costs weeks or money.

## When a Graph Is Worth It

Use a graph when the work has **multiple steps, multiple sources, parallel paths, checks, risks, or approvals**:
- Deep research and idea validation
- Go-to-market plans, launch decisions, pricing decisions
- Synthesising customer feedback from many sources
- Recurring content production
- Anything where the output needs checking before it matters

Do NOT use a graph for brainstorming ten names or summarising an email. The goal is the **smallest graph that raises quality** — more agents can mean more noise, five workers confidently repeating the same wrong idea, or a system that spends more time coordinating than thinking.

## Vocabulary

- **Jobs** — the steps (planner, researcher, skeptic, merger, human gate)
- **Arrows** — what depends on what; jobs with no arrow between them can run in parallel
- **State** — the shared record of what the system knows so far, written to files

## The Diamond Pattern (default shape)

```
                 ┌─ lane A ─┐
question → plan ─┼─ lane B ─┼─ skeptic → merge → human gate
                 └─ lane C ─┘
```

One question splits into parallel lanes, a checker attacks the results, the survivors merge into one answer, and a human approves before anything expensive happens.

---

## Process

### Phase 1: Define the graph

1. **Final output in one sentence.** e.g. "A one-page recommendation on whether this idea is worth testing." If the user can't say it, help them: what decision will this output drive?
2. **List the jobs a great human team would do.** Clarify the question, research X, research Y, check the evidence, make the recommendation.
3. **Draw the arrows.** Which jobs genuinely depend on another job's output? Everything else runs in parallel. Delete fake waiting.
4. **Separate the writer from the checker.** The skeptic is always its own job — never let a lane grade its own output. Use the `@skeptic` agent.
5. **Place the human gate where mistakes are expensive.** Private memo → light gate. Customer email, public post, code deploy, refund, production data → strict gate, nothing proceeds without explicit approval.

Show the user the graph as a simple diagram (like the one above, with their real lane names) and the lane briefs BEFORE running it. This is the cheap moment to fix the structure.

### Phase 2: Run it with a paper trail

Create `docs/graphs/<slug>/` (slug from the question, e.g. `shopify-bookkeeping/`). Every job writes its own file — this is the state:

```
docs/graphs/<slug>/
  plan.md            # the planner's split: lanes, briefs, arrows, gate placement
  <lane-name>.md     # one file per lane (customer.md, competitors.md, distribution.md, ...)
  review.md          # the skeptic pass: killed / wounded / survived / unanswered
  recommendation.md  # the merge: recommendation built ONLY from surviving evidence
```

Execution:
1. **Planner** (you, inline): write `plan.md` — each lane gets a brief with the question, what evidence would settle it, and instructions to date claims and note what could not be confirmed.
2. **Lanes**: launch one subagent per lane **in parallel in a single message** (Agent tool; use a Workflow only if the user has opted into multi-agent orchestration). Each lane receives its brief plus shared context, and returns findings which you write to its file. Lanes are blind to each other — that independence is the point.
3. **Skeptic**: launch the `@skeptic` agent on ALL lane outputs together. It attacks support, staleness, omission, conflation, and confidence-without-proof, then writes `review.md`.
4. **Merge** (you, inline): write `recommendation.md` using only claims that survived. Include: the recommendation, the wedge/next action, what to test this week, and **what evidence would change the answer**.
5. **Human gate**: present the recommendation and stop. The graph produces the evidence; the human makes the decision. Never take the gated action yourself.

### Phase 3: Compound

- Tell the user where the paper trail lives. The real value compounds across runs: every research graph creates better notes, every content graph creates better audience insight — the graph produces the work AND the memory that makes the next graph smarter.
- If this graph shape will recur (weekly content run, monthly competitive check), offer to save the structure: a reusable `plan.md` template in the same folder, or a project command if it's earned one.

## Rules

- **Smallest graph that raises quality.** 3-5 lanes is the sweet spot. If two lanes would return the same findings, merge them.
- **Writer ≠ checker, checker ≠ merger.** Three different jobs. The skeptic reports what survived; it does not write the recommendation.
- **Parallel by default.** Only add an arrow when the dependency is real. Sequential lanes are the chat-window habit this skill exists to break.
- **Stop when the answer is good enough.** A graph that loops without a stop condition is a bill, not a workflow.
- **The paper trail is not optional.** Files are what make runs comparable, reusable, and auditable.

## Common Mistakes

- Automating a workflow you don't understand yet — if the manual/first run doesn't produce clearly better work, a fancier harness will just produce mediocre work faster
- One giant lane that does everything (that's the chat window with extra steps)
- A skeptic prompted to "review" instead of to kill — give it permission to be brutal
- Putting the human gate at the start (where it blocks nothing expensive) instead of before the consequential action
- Building the biggest graph possible because it looks impressive
