# Preclaude Hooks (opt-in)

Starter [Claude Code hooks](https://code.claude.com/docs/en/hooks-guide) you can enable in one minute. They are **not active by default** — copy what you want into your settings.

## What's included

| Hook | Event | What it does |
|------|-------|--------------|
| `block-dangerous.sh` | PreToolUse (Bash) | Blocks obviously destructive commands (`rm -rf /`, force-push, `git reset --hard`, fork bombs) before they run |
| `format-on-edit.sh` | PostToolUse (Edit/Write) | Runs Prettier on files Claude edits — only in projects that already have a Prettier config |
| Quality-gate prompt | Stop | A prompt-based hook that stops Claude finishing without having run lint/typecheck/tests |

## Enable

1. Open `hooks/hooks.example.json` and copy the blocks you want.
2. Paste them into the `"hooks"` section of `~/.claude/settings.json` (all projects) or `.claude/settings.json` in a project (that project only).
3. Adjust the script paths for your install method: the examples use `~/.preclaude/hooks/scripts/...` (shell installer). If you installed Preclaude as a plugin, use `${CLAUDE_PLUGIN_ROOT}/hooks/scripts/...` instead; for any other location, point at wherever the repo lives.
4. Restart Claude Code. Verify with `/hooks`.

## Notes

- Hook scripts receive JSON on stdin; exit code 2 blocks the action, anything on stderr is shown to Claude.
- The Stop hook uses the `prompt` type — no script needed; Claude Code evaluates the prompt and blocks or approves.
- Write your own: ask Claude to "create a hook that ..." or see the [hooks reference](https://code.claude.com/docs/en/hooks).
