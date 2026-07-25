#!/bin/bash
# SessionStart hook: tells you when Preclaude is behind, without ever touching
# your install.
#
# Preclaude does not auto-update. This prints a one-line nudge when there are
# new commits upstream; running /update is still your call.
#
# Session start never waits on the network: it reports the result of the *last*
# fetch from a cache file, then refreshes that cache in the background for next
# time. Nothing is pulled, written to, or changed in the repo itself.
#
# Config (environment variables):
#   PRECLAUDE_DIR               install location (default: ~/.preclaude)
#   PRECLAUDE_UPDATE_INTERVAL   seconds between background fetches (default: 86400)

set -u

DIR="${PRECLAUDE_DIR:-$HOME/.preclaude}"
INTERVAL="${PRECLAUDE_UPDATE_INTERVAL:-86400}"

# Cache lives outside the clone — writing it inside would make the repo look
# dirty and trip the local-modifications warning below.
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}/preclaude"
STATE="$CACHE_DIR/update-check"

# Not a shell install (plugin users update through the plugin manager), or not a
# git clone — nothing to report either way.
[ -d "$DIR/.git" ] || exit 0

# Which upstream to compare against: the branch's own, falling back to main.
upstream() {
  git -C "$DIR" rev-parse --abbrev-ref '@{u}' 2>/dev/null || echo "origin/main"
}

# --- report from cache -------------------------------------------------------

if [ -f "$STATE" ]; then
  BEHIND=$(head -n1 "$STATE" 2>/dev/null)
  case "$BEHIND" in
    ''|*[!0-9]*) BEHIND=0 ;;
  esac

  if [ "$BEHIND" -gt 0 ]; then
    printf 'Preclaude is %s commit(s) behind %s. Run /update to pull.\n' "$BEHIND" "$(upstream)"

    # A dirty clone is the usual reason /update conflicts — say so up front.
    if [ -n "$(git -C "$DIR" status --porcelain 2>/dev/null)" ]; then
      printf 'Note: %s has local modifications, so the update may need a stash first.\n' "$DIR"
    fi
  fi
fi

# --- refresh the cache in the background ------------------------------------

if [ -f "$STATE" ]; then
  MTIME=$(stat -f %m "$STATE" 2>/dev/null || stat -c %Y "$STATE" 2>/dev/null || echo 0)
  AGE=$(( $(date +%s) - MTIME ))
  [ "$AGE" -lt "$INTERVAL" ] && exit 0
fi

mkdir -p "$CACHE_DIR" 2>/dev/null || exit 0

(
  git -C "$DIR" fetch --quiet origin 2>/dev/null || exit 0
  git -C "$DIR" rev-list --count "HEAD..$(upstream)" 2>/dev/null > "$STATE.tmp" || exit 0
  mv "$STATE.tmp" "$STATE" 2>/dev/null
) >/dev/null 2>&1 &

exit 0
