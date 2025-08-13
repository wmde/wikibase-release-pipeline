#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Clean stdout, structured log:
# - stdout: no timestamps / no [LEVEL]
# - log   : ISO8601 timestamp + [LEVEL]
# -----------------------------------------------------------------------------

LOG_PATH=${LOG_PATH:=/tmp/wbs-deploy-setup.log}
DEBUG=${DEBUG:=false}

mkdir -p "$(dirname "$LOG_PATH")" 2>/dev/null || true
touch "$LOG_PATH" 2>/dev/null || true

# Are we attached to a terminal?
INTERACTIVE=false
[ -t 1 ] && INTERACTIVE=true

_timestamp() { date -u +"%FT%TZ"; }

# status "Message..."
# - stdout: "Message..."
# - log   : "2025-08-12T10:00:00Z [status] Message..."
status() {
  printf '%s [status] %s\n' "$(_timestamp)" "$*" >> "$LOG_PATH"
  printf '%s\n' "$*"                                   # clean stdout
}

# debug "Message..."
# - stdout: shown only if DEBUG=true (clean)
# - log   : "2025-08-12T10:00:00Z [DEBUG] Message..."
debug() {
  printf '%s [debug] %s\n' "$(_timestamp)" "$*" >> "$LOG_PATH"
  if [ "$DEBUG" = true ]; then
    printf '%s\n' "$*"
  fi
}

# run "command string"
# Always logs. Mirrors to stdout only if INTERACTIVE && DEBUG.
# Log format:
#   2025-... [DEBUG] $ command string
#   <raw command output...>
run() {
  local cmd="$*"
  printf '%s [debug] $ %s\n' "$(_timestamp)" "$cmd" >> "$LOG_PATH"

  if $INTERACTIVE && [ "$DEBUG" = true ]; then
    # mirror to screen and append to log
    bash -c "$cmd" 2>&1 | tee -a "$LOG_PATH"
  else
    # log only
    bash -c "$cmd" >>"$LOG_PATH" 2>&1
  fi
}
