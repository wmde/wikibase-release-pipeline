#!/usr/bin/env bash
set -euo pipefail

# --- Expected Variables ---

export WBS_DIR
export DEBUG
export INSTALLER_DEV
export LOCALHOST
export LOG_PATH
INSTALL_ARGS=( "$@" )

# --- Bootstrap Logging ---

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"
# -- Script Specific Variables --

SERVER_IP=$(curl --silent --show-error --fail https://api.ipify.org || echo "127.0.0.1")
run_cli_config() {
  if [ -t 0 ] && [ -t 1 ]; then
    TTY_FLAGS="-it"
  else
    TTY_FLAGS="-i"
  fi

  docker run $TTY_FLAGS --rm \
    -e SERVER_IP="$SERVER_IP" \
    -e LOCALHOST="$LOCALHOST" \
    -v "$WBS_DIR:/app/wbs" \
    -v "$LOG_PATH:/app/installation.log" \
    "$WBS_TOOLS_IMAGE" \
    node dist/wbs.js install "${INSTALL_ARGS[@]}"
}

echo
echo "🔧 Starting command-line installer..."
echo

run_cli_config
