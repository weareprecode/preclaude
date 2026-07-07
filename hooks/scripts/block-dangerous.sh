#!/bin/bash
# PreToolUse hook: blocks obviously destructive Bash commands.
# Input: hook JSON on stdin. Exit 2 blocks the tool call; anything on
# stderr is shown to Claude as the reason.

INPUT=$(cat)

COMMAND=$(printf '%s' "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null)

# Nothing parseable — allow
[ -z "$COMMAND" ] && exit 0

DANGEROUS=(
  'rm -rf /'
  'rm -rf ~'
  'rm -rf \*'
  'git push --force'
  'git push -f'
  'git reset --hard'
  'chmod -R 777'
  '> /dev/sda'
  'mkfs\.'
  ':(){ :|:& };:'
)

for pattern in "${DANGEROUS[@]}"; do
  if printf '%s' "$COMMAND" | grep -qE "$pattern"; then
    echo "Blocked by Preclaude hook: command matches dangerous pattern '$pattern'. If this is genuinely intended, run it manually." >&2
    exit 2
  fi
done

exit 0
