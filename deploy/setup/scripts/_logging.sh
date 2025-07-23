#!/usr/bin/env bash

echo "in logging and seeing LOG_PATH: $LOG_PATH"

if [ -z "$LOG_PATH" ]; then
  CALLING_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[1]}")/../.." && pwd)"
  LOG_PATH="$CALLING_SCRIPT_DIR/wbs-deploy-setup.log"
fi

mkdir -p "$(dirname "$LOG_PATH")"
touch "$LOG_PATH" 2>/dev/null || true

if [ ! -w "$LOG_PATH" ]; then
  echo "⚠️ Cannot write to log file: $LOG_PATH" >&2
fi

log() {
  if [ "$VERBOSE" = true ]; then
    echo "$@"
  fi
}

log_cmd() {
  if [ "$VERBOSE" = true ]; then
    bash -c "$@"
  else
    bash -c "$@" &>> "$LOG_PATH"
  fi
  return $?
}
