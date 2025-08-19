#!/usr/bin/env bash
set -euo pipefail

# --- Expected Variables from environment ---

export DEBUG
export DEV
export LOCALHOST
export LOG_PATH
export SKIP_DEPENDENCY_INSTALLS
export SKIP_LAUNCH
export DEPLOY_DIR
export SCRIPTS_DIR
export SETUP_DIR

# --- Bootstrap logging ---

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"

# --- Setup Phase ---

if ! $SKIP_DEPENDENCY_INSTALLS; then
  bash "$SCRIPTS_DIR/install-docker.sh"
fi

bash "$SCRIPTS_DIR/web-config.sh"

# --- Launch or exit ---

if $SKIP_LAUNCH; then
  status "SKIP_LAUNCH=true; not starting services."
  exit 0
fi

# Detach to avoid accidental interruption of the launch process
debug "Starting background process..."
nohup env \
  DEPLOY_DIR="$DEPLOY_DIR" \
  LOG_PATH="$LOG_PATH" \
  DEBUG="$DEBUG" \
  LOCALHOST="$LOCALHOST" \
  bash "$SCRIPTS_DIR/launch.sh" \
  >/dev/null 2>&1 &

echo "It is now safe to close this terminal session."
echo

exit 0
