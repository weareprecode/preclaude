# Preclaude Hooks (opt-in)

Starter [Claude Code hooks](https://code.claude.com/docs/en/hooks-guide) you can enable in one minute. They are **not active by default** — copy what you want into your settings.

## What's included

| Hook | Event | What it does |
|------|-------|--------------|
| `update-nudge.sh` | SessionStart | Prints a one-line nudge when Preclaude is behind upstream. Preclaude never auto-updates — this just tells you, and running `/update` stays your call |
| `block-dangerous.sh` | PreToolUse (Bash) | Blocks obviously destructive commands (`rm -rf /`, force-push, `git reset --hard`, fork bombs) before they run |
| `format-on-edit.sh` | PostToolUse (Edit/Write) | Runs Prettier on files Claude edits — only in projects that already have a Prettier config |
| Quality-gate prompt | Stop | A prompt-based hook that stops Claude finishing without having run lint/typecheck/tests |

## Enable

1. Open `hooks/hooks.example.json` and copy the blocks you want.
2. Paste them into the `"hooks"` section of `~/.claude/settings.json` (all projects) or `.claude/settings.json` in a project (that project only).
3. Adjust the script paths for your install method: the examples use `~/.preclaude/hooks/scripts/...` (shell installer). If you installed Preclaude as a plugin, use `${CLAUDE_PLUGIN_ROOT}/hooks/scripts/...` instead; for any other location, point at wherever the repo lives.
4. Restart Claude Code. Verify with `/hooks`.

## About the update nudge

It never touches your install — nothing is pulled, stashed or written to the repo. Session start never waits on the network either: it reports the result of the *last* fetch from a cache under `~/.cache/preclaude/`, then refreshes that cache in the background for next time. Typical cost is ~30ms.

It stays quiet when you're up to date, when the fetch fails (offline, no remote), and when Preclaude was installed as a plugin rather than as a clone — plugin users update through the plugin manager instead. If the clone has local modifications it says so, since that's the usual reason `/update` needs a stash first.

Two environment variables tune it: `PRECLAUDE_DIR` (default `~/.preclaude`) and `PRECLAUDE_UPDATE_INTERVAL` in seconds (default `86400`, i.e. one fetch a day).

## Notes

- Hook scripts receive JSON on stdin; exit code 2 blocks the action, anything on stderr is shown to Claude.
- The Stop hook uses the `prompt` type — no script needed; Claude Code evaluates the prompt and blocks or approves.
- Write your own: ask Claude to "create a hook that ..." or see the [hooks reference](https://code.claude.com/docs/en/hooks).
