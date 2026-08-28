---
name: remember
description: Write a detailed memory record into memory/ (decision, deploy, gotcha or session), append its INDEX line, and rewrite NOW.md if what is in flight or owed has changed. Use when the user says /remember, "save this to memory", "record this decision", at the end of a session, or after any deploy or production step.
---

# /remember — write a memory record

You are writing for a Claude session that has **none** of this conversation's
context, possibly on the other operator's machine. Detail is the point.
Length is not a concern; vagueness is.

## 1. Interview the session before writing

Answer every one of these from the transcript. If one has no answer, say so
in the record rather than leaving the section out.

- **Context** — what was true before, what prompted this, what constraints
  applied (rules from CLAUDE.md, production state, time, access).
- **Options considered** — every alternative discussed or implied, and why
  each was rejected. This is the section that stops the next session
  re-proposing a rejected idea. If only one option was ever on the table,
  say that explicitly.
- **Decision** — what was chosen, stated as a rule the next agent can apply.
  Rules ("never merge while a run is executing"), not reactions ("this was
  painful").
- **Consequences** — what changed, what broke, what is now forbidden, what
  other files or systems this touches.
- **Still owed** — concrete unfinished steps, each with who owns it. Include
  production steps a human must run because Claude cannot.
- **Evidence** — commits, PR numbers, issue numbers, artefact URLs,
  screenshots saved under `memory/assets/`. Artefact URLs are references
  only; the substance goes in the record.

## 2. Pick the kind and the author

- `kind`: `decision` (a choice with alternatives), `deploy` (something
  reached production or an external platform), `gotcha` (a trap that cost
  time and its recipe), `session` (end-of-session handover).
- `author`: the operator's first name in lower case, taken from
  `git config user.name`.

## 3. Write the record

File: `memory/YYYY-MM-DD-<author>-<slug>.md` (today's date, short kebab slug).
Never overwrite an existing record; write a new one and mark the old one
`status: superseded-by: <new file>` if it is now wrong.

```markdown
---
date: YYYY-MM-DD
author: ben
kind: decision | deploy | gotcha | session
status: open | done | superseded-by: <file>
touches: comma-separated paths or systems
title: One line, specific, no trailing full stop
---

## Context
## Options considered
## Decision
## Consequences
## Still owed
## Evidence
```

Rules:
- **No secrets.** No env values, tokens, webhook secrets, connection strings,
  passwords (dev seed credentials excepted). Identifiers are fine.
- British English.
- If a record contradicts `CLAUDE.md` or a curated document under `docs/`,
  those win: either fix them in the same change or mark the record
  `superseded-by`.

## 4. Append the INDEX line

Append exactly one line to `memory/INDEX.md`, never edit or reorder others:

```
- YYYY-MM-DD [kind] Title (author) → filename.md
```

## 5. Rewrite NOW.md if the world changed

If the record changes anything in `memory/NOW.md` (in flight, owed in
production, blocked, open issues, who is on what), rewrite that file so it is
true as of now. Overwrite; never append a dated section. Update its "as of"
date in the heading. For `kind: session` records this step is mandatory.

## 6. Promote when durable

If the Decision is settled truth rather than a dated event, also add it to the
relevant curated document (a decisions or gotchas file under `docs/`, or
`CLAUDE.md` if the project has no `docs/`) and note in the record's
Consequences that it was promoted. Remove the INDEX line only when
the record is fully absorbed and marked `superseded-by`.

Finish by telling the user the record's filename and whether NOW.md changed.
