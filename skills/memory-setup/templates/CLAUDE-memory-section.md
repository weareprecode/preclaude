
## Memory

`memory/` is the shared, git-committed record of what happened, so that any
new session on any machine has full context after a pull. Hierarchy when
things disagree: **this file > `docs/` > `memory/`**. `docs/` is curated
truth; `memory/` is the dated record.

- `memory/NOW.md` — what is in flight, owed, blocked, and who is on what.
  **Rewrite it at the end of every session.** Overwrite, never append.
- `memory/INDEX.md` — one line per record, append-only (`merge=union`).
- `memory/YYYY-MM-DD-<author>-<slug>.md` — one detailed record per decision,
  deploy, gotcha or session: Context, Options considered, Decision,
  Consequences, Still owed, Evidence. Records are rules the next agent can
  apply, not diary. No secrets, ever.

Protocol:

1. Start of session: read `NOW.md` (imported below), then open the records
   it names before touching related code.
2. After any decision with alternatives, any deploy or production step, any
   trap that cost time, and at the end of every session: run `/remember`
   (`.claude/skills/remember/SKILL.md`). It interviews the session, writes
   the record, appends the INDEX line and rewrites `NOW.md`.
3. A committed Stop hook blocks finishing a turn when source changed but
   `memory/` did not; CI fails a PR the same way unless its body carries
   `no-memory: <reason>`.
4. When a record's content becomes settled truth, promote it into the
   relevant `docs/` file and mark the record `superseded-by`.

@memory/NOW.md
@memory/INDEX.md
