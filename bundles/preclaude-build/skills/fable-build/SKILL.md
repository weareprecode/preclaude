---
name: fable-build
description: Multi-model build pattern — Claude Fable 5 does the scaffolding (architecture, contracts, task plan) while Opus/Sonnet carry out the implementation, either as Claude Code subagents or via the Anthropic advisor tool in API code. Use when running /fable-build, when asked to "scaffold with Fable", "use Fable to plan and Sonnet to build", "add the advisor tool", "pair an executor with an advisor model", or when building a feature where planning quality matters more than who types the code.
---

# Fable Build — Scaffold with Fable, Build with Opus/Sonnet

The most expensive model should make the decisions, not type the boilerplate. This skill implements that split two ways:

- **Mode A — in Claude Code**: the session model (ideally Fable 5) produces the scaffold — architecture, interface contracts, file skeletons, atomic task plan — then delegates implementation to Opus/Sonnet subagents and reviews the result.
- **Mode B — in API code**: when the deliverable is a script, pipeline, or product feature, use Anthropic's **advisor tool**: a Sonnet/Opus executor generates the bulk of the tokens and consults a Fable 5 advisor mid-generation for strategic guidance. You get close to Fable-solo quality at executor-model rates.

Pick the mode by where the work runs: interactive repo work → Mode A; autonomous scripts, Ralph-style loops, or the user's own product → Mode B. Full API detail for Mode B lives in [reference.md](reference.md).

---

## Mode A: Fable scaffolds, subagents build (Claude Code)

Scaffolding quality tracks the session model. If the session is not already on the most capable model available, say so before starting ("scaffolding benefits from the strongest model — consider `/model` to switch") but proceed either way.

### Phase 1 — Scaffold (main session, no delegation)

Produce four artifacts before any implementation:

1. **Architecture decision** — 5–10 lines: the approach, the one alternative considered, why rejected. No essays.
2. **Interface contracts** — the exact types/signatures/schemas at every seam between tasks (function signatures, API shapes, DB schema, component props). Contracts are the anti-drift mechanism: builders never invent interfaces.
3. **File skeletons** — create the real files with imports, types, exported signatures, and `// TODO(builder): ...` bodies. Skeletons must typecheck (stub returns are fine).
4. **Task plan** — atomic tasks, each: one clear deliverable, the files it owns, the contract it implements, a checkable acceptance criterion (test passes, typecheck clean, endpoint returns X). Sized like Ralph stories: describable in 2–3 sentences, ~30 min of focused work, no two tasks writing the same file.

### Phase 2 — Delegate the build

Dispatch each task to a subagent with an explicit model:

- **`model: sonnet`** — the default builder for standard implementation.
- **`model: opus`** — complex subsystems: concurrency, intricate algorithms, security-sensitive code, gnarly migrations.
- **`model: haiku`** — only mechanical work (renames, fixture generation).

Each task prompt must carry: the contract verbatim, the skeleton file paths, the acceptance criterion, and the instruction *"Implement exactly this contract. If the contract seems wrong, STOP and report back — do not redesign the interface."* Run independent tasks in parallel; dependency-ordered tasks in sequence. Builders that touch overlapping files get worktree isolation.

### Phase 3 — Review and integrate (main session)

The scaffolder verifies, never rubber-stamps:

1. Run the project's checks (typecheck, lint, tests) after each wave of tasks.
2. Diff each task's output against its contract. Interface drift is fixed by the scaffolder; logic bugs go back to a builder with the failure attached.
3. Before declaring done, do one whole-system pass: does the assembled result actually satisfy the original request, not just the task list?

### Escalation rules (both directions)

Mirroring the advisor tool's measured best practices:

- Builders consult the scaffolder **before their first substantive write** if anything about the contract is ambiguous — orientation is free, redesign is not.
- Builders escalate when **stuck** (recurring errors, approach not converging) instead of thrashing.
- On a conflict between what a builder found and what the scaffold says, **surface it explicitly** ("the contract says X, the existing code does Y — which wins?") rather than silently picking one.
- The scaffolder makes a final review pass **after** deliverables are durable (files written, committed), not before.

---

## Mode B: the advisor tool (API code)

When writing code that calls Claude — a build script, an autonomous loop, an AI feature — implement the same split natively with the **advisor tool**: the executor model calls `advisor` like any tool; the API runs a server-side sub-inference on the advisor model, which sees the full transcript and returns a plan or course-correction; the executor continues. One `/v1/messages` request, no extra round trips.

### Minimal shape (TypeScript)

```typescript
const response = await client.beta.messages.create({
  model: "claude-sonnet-5",                    // executor — types the code
  max_tokens: 16000,
  betas: ["advisor-tool-2026-03-01"],
  tools: [
    {
      type: "advisor_20260301",
      name: "advisor",
      model: "claude-fable-5",                 // advisor — makes the decisions
      max_tokens: 2048,                        // caps advisor output; ~7x cheaper, no quality loss
    },
    // ...your other tools
  ],
  messages: [{ role: "user", content: "Scaffold and build a worker pool with graceful shutdown." }],
});
```

### The rules that matter

- **Pairing**: the advisor must be at least as capable as the executor. `claude-fable-5` can advise every current executor (Haiku 4.5, Sonnet 4.6/5, Opus 4.6/4.7/4.8, Fable 5). Invalid pairs → 400.
- **Fable advisors return `advisor_redacted_result`** (opaque `encrypted_content`, not readable text). Round-trip the block verbatim on later turns; the server decrypts it into the executor's prompt. Branch on `content.type` if you might switch advisor models.
- **Multi-turn**: pass the full assistant content (including `advisor_tool_result` blocks) back on every turn. Dropping the advisor tool from `tools` while history contains advisor blocks → 400.
- **Recommended defaults**: `max_tokens: 2048` on the tool definition; `caching: {type: "ephemeral", ttl: "5m"}` only when expecting 3+ advisor calls per conversation; prepend `"(Advisor: please keep your guidance under 80 words — I need a focused starting point, not a comprehensive plan.)"` to the user message to trim advisor output further.
- **Prompt the executor to call it at the right times** — before substantive work, when stuck, before declaring done. Copy the tested system-prompt blocks from [reference.md](reference.md); they are measured, not vibes (Haiku +7.5pp with the hard-rule block; do NOT nudge Opus executors — it lowered their pass rates).
- **Cost model**: advisor calls bill at the advisor's rates ($10/$50 per MTok for Fable 5) but produce only ~400–700 text tokens of advice; the executor generates the actual output at its rates (Sonnet 5 $3/$15). Read per-call usage from `usage.iterations[]` — top-level `usage` is executor-only.
- **Availability**: Claude API and Claude Platform on AWS only (not Bedrock/Vertex/Foundry). Fable 5 requires 30-day data retention (orgs on ZDR get 400s) — fall back to `claude-opus-4-8` as the advisor if that blocks.

For the full parameter table, error codes, pause_turn resumption, caching economics, the tested system-prompt blocks, and per-language snippets: read [reference.md](reference.md) before writing production code.

---

## Choosing executor/advisor pairs

| Situation | Executor | Advisor |
|---|---|---|
| Default build loop | `claude-sonnet-5` | `claude-fable-5` |
| Quality lift on an existing Sonnet workload at similar cost | `claude-sonnet-5` | `claude-opus-4-8` |
| Hardest subsystems, executor needs more headroom | `claude-opus-4-8` | `claude-fable-5` |
| High-volume cheap tasks stepping up in intelligence | `claude-haiku-4-5` | `claude-opus-4-8` |

Skip the advisor entirely for single-turn Q&A (nothing to plan) and workloads where every turn genuinely needs the advisor's full capability (just run the big model as the executor).
