# Advisor Tool — API Reference (for fable-build Mode B)

Condensed from the official docs (platform.claude.com → agents-and-tools/tool-use/advisor-tool, fetched 2026-07). Beta: include header `advisor-tool-2026-03-01` (SDKs: `betas: ["advisor-tool-2026-03-01"]` on `client.beta.messages.*`).

## Tool definition parameters

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `type` | string | *required* | Must be `"advisor_20260301"` |
| `name` | string | *required* | Must be `"advisor"` |
| `model` | string | *required* | Advisor model ID (e.g. `claude-fable-5`, `claude-opus-4-8`). Billed at this model's rates for the sub-inference |
| `max_uses` | int | unlimited | Per-request cap. Exceeding it returns `advisor_tool_result_error` with `max_uses_exceeded`; the executor continues without advice |
| `max_tokens` | int | advisor's output cap | Caps advisor output (thinking + text) per call. Min 1024. **Recommended: 2048** — ~7x less advisor output with near-zero truncation and no measured quality loss. The server tells the advisor its remaining budget so it shapes the response to fit. Truncation appends `[Advisor output truncated at max_tokens=N.]` and sets `stop_reason: "max_tokens"` on the result |
| `caching` | object\|null | off | `{"type": "ephemeral", "ttl": "5m" \| "1h"}` — caches the advisor's own transcript across calls in a conversation. Breaks even at ~3 advisor calls; keep off for short tasks; never toggle mid-conversation |

## Model compatibility (advisor must be ≥ executor)

| Executor | Valid advisors |
|---|---|
| `claude-haiku-4-5`, `claude-sonnet-4-6` | Fable 5, Mythos 5, Opus 4.8/4.7/4.6, Sonnet 4.6 |
| `claude-sonnet-5` | Fable 5, Mythos 5, Opus 4.8/4.7 |
| `claude-opus-4-6` | Fable 5, Mythos 5, Opus 4.8/4.7/4.6 |
| `claude-opus-4-7` / `claude-opus-4-8` | Fable 5, Mythos 5, Opus 4.8/4.7 |
| `claude-fable-5` | Fable 5 only |

Invalid pair → `400 invalid_request_error` naming the combination.

## How a call works

1. Executor emits `server_tool_use` with `name: "advisor"` and **empty `input`** (the executor signals timing; the server supplies context — nothing the executor puts in input reaches the advisor).
2. Server runs the advisor model with its own Anthropic system prompt + the executor's full transcript (your system prompt, tools, prior turns, tool results, text so far).
3. Result returns as an `advisor_tool_result` block; the executor continues. The advisor runs without tools; its thinking is dropped — only advice text reaches the executor.

## Result variants

| Variant | Fields | When |
|---|---|---|
| `advisor_result` | `text`, `stop_reason`* | Advisor returns plaintext (Opus/Sonnet advisors) |
| `advisor_redacted_result` | `encrypted_content`, `stop_reason`* | **Fable 5 / Mythos 5 advisors** — opaque blob; the server decrypts it into the executor's prompt next turn |

*`stop_reason` present only when `max_tokens` is set on the tool definition. Round-trip content verbatim on subsequent turns; branch on `content.type` if switching advisor models mid-conversation.

## Errors (result-level; the request itself succeeds)

`max_uses_exceeded` · `too_many_requests` (advisor rate-limited — draws from the advisor model's own bucket) · `overloaded` · `prompt_too_long` · `execution_time_exceeded` · `unavailable`. The executor sees the error and continues without advice. An executor rate limit, by contrast, fails the whole request with HTTP 429.

## Multi-turn rules

- Append the **full** assistant content (including `advisor_tool_result` blocks) back to `messages` each turn.
- Omitting the advisor tool from `tools` while history contains advisor blocks → 400. To cap advisor spend conversation-wide: count calls client-side, then remove the tool **and** strip all `advisor_tool_result` blocks from history.
- **`pause_turn`**: a response can end with `stop_reason: "pause_turn"` with a pending advisor call (a `server_tool_use` with no result). Resume by appending that assistant message unchanged and re-sending with the same tool + beta header — no user message or tool_result needed. If the executor also called one of your tools that turn, you get `stop_reason: "tool_use"` instead; send your `tool_result`s as usual and the pending advisor call runs at the start of the next request.

## Tested system-prompt blocks (coding/agent executors)

Prepend to the executor system prompt, before any other advisor mention:

```text
You have access to an `advisor` tool backed by a stronger reviewer model. It takes NO parameters — when you call advisor(), your entire conversation history is automatically forwarded. They see the task, every tool call you've made, every result you've seen.

Call advisor BEFORE substantive work — before writing, before committing to an interpretation, before building on an assumption. If the task requires orientation first (finding files, fetching a source, seeing what's there), do that, then call advisor. Orientation is not substantive work. Writing, editing, and declaring an answer are.

Also call advisor:
- When you believe the task is complete. BEFORE this call, make your deliverable durable: write the file, save the result, commit the change.
- When stuck — errors recurring, approach not converging, results that don't fit.
- When considering a change of approach.

On tasks longer than a few steps, call advisor at least once before committing to an approach and once before declaring done.
```

Followed directly by:

```text
Give the advice serious weight. If you follow a step and it fails empirically, or you have primary-source evidence that contradicts a specific claim, adapt. If you've already retrieved data pointing one way and the advisor points another: don't silently switch. Surface the conflict in one more advisor call — "I found X, you suggest Y, which constraint breaks the tie?"
```

Measured tuning notes:
- **Haiku executors on coding workloads**: use the stronger variant with the hard rule ("your first write_file/edit_file/state-changing bash call must be preceded by an advisor call; read-only orientation doesn't count") — +7.5pp pass rate. Costs ~4pp on browse/lookup workloads, so gate on workload type.
- **Nudge (mid-conversation reminder)**: if a Haiku executor hasn't called the advisor by turn 2, inject a user message reminding it (+~7pp on Haiku). No effect on Sonnet; **slightly harms Opus — never nudge Opus executors**. Don't combine the nudge with restraint language in the system prompt.
- **Trim advisor output**: prepend to the user message: `(Advisor: please keep your guidance under 80 words — I need a focused starting point, not a comprehensive plan.)` Ask for ~80% of your true ceiling; also raises consult frequency but nets lower total cost.
- **Forcing a consult**: `tool_choice: {"type": "tool", "name": "advisor"}` — cannot be combined with extended thinking (400).
- **Effort pairing**: Sonnet executor at `medium` effort + Opus advisor ≈ Sonnet at default effort, at lower cost. For maximum intelligence keep the executor at default effort.

## Billing

Usage reports in `usage.iterations[]`: entries with `type: "advisor_message"` bill at the advisor model's rates; `type: "message"` at the executor's. Top-level `usage` reflects executor tokens only. Advisor output is typically 400–700 text tokens (1,400–1,800 incl. thinking) uncapped on light workloads; hard-reasoning tasks run 4,200–5,900 uncapped — hence `max_tokens: 2048`. Top-level `max_tokens` and task budgets do NOT bound advisor tokens.

Current pricing context (per MTok, cached 2026-06): Fable 5 $10/$50 · Opus 4.8 $5/$25 · Sonnet 5 $3/$15 ($2/$10 intro to 2026-08-31) · Haiku 4.5 $1/$5.

## Streaming

The advisor sub-inference does not stream: the executor's stream pauses after the `server_tool_use` block closes (SSE pings ~every 30s during the pause), then the full `advisor_tool_result` arrives in one `content_block_start` event and executor output resumes. A `message_delta` follows with updated `usage.iterations`.

## Availability and constraints

- Claude API and Claude Platform on AWS only. **Not** on Amazon Bedrock, Google Vertex AI, or Microsoft Foundry.
- The feature is ZDR-eligible, but **Fable 5 itself requires 30-day data retention** — a ZDR org gets 400s on any Fable request. Fall back to `claude-opus-4-8` as the advisor in that case.
- `clear_thinking` with `keep` other than `"all"` shifts the advisor's quoted transcript each turn → advisor-side cache misses (cost only, not quality). Set `keep: "all"` if using advisor caching with extended thinking.
- Composes with other tools (web search, code execution, custom tools) in the same `tools` array.
