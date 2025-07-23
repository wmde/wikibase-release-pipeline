#!/usr/bin/env bash

if [ -z "$LOG_PATH" ]; then
  LOG_PATH="/tmp/wbs-deploy-setup.log"
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
