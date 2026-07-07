#!/bin/bash
# PostToolUse hook: auto-formats JS/TS/CSS/MD files with Prettier after
# Claude edits them — only when the project already uses Prettier.
# Never blocks: always exits 0.

INPUT=$(cat)

FILE=$(printf '%s' "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null)

[ -z "$FILE" ] && exit 0
[ ! -f "$FILE" ] && exit 0

case "$FILE" in
  *.js|*.jsx|*.ts|*.tsx|*.css|*.scss|*.json|*.md) ;;
  *) exit 0 ;;
esac

# Only format if the project has a Prettier config (respects project choice)
DIR=$(dirname "$FILE")
while [ "$DIR" != "/" ]; do
  if ls "$DIR"/.prettierrc* "$DIR"/prettier.config.* >/dev/null 2>&1; then
    npx --no-install prettier --write "$FILE" >/dev/null 2>&1 || true
    break
  fi
  [ -f "$DIR/package.json" ] && break
  DIR=$(dirname "$DIR")
done

exit 0
