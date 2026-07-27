#!/usr/bin/env bash
set -euo pipefail

# --- Expected Variables ---

export WBS_DIR
export DEBUG
export DEV
export LOCALHOST
export LOG_PATH
export TOOLS_DIR

# --- Bootstrap Logging ---

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"
# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_versions.sh"

# -- Script Specific Variables --

SERVER_IP=$(curl --silent --show-error --fail https://api.ipify.org || echo "127.0.0.1")
WBS_TOOLS_PROJECT_DIR="$WBS_DIR/development/images/wbs-tools"

build_installer_runtime() {
  # BuildKit (via buildx with the docker-container driver) does not load images
  # into the local Docker image store by default. --load ensures it's available
  # to `docker run`.
  BUILDKIT_DRIVER=$(docker buildx inspect | grep 'Driver:' | awk '{print $2}')
  if [ "$BUILDKIT_DRIVER" = "docker-container" ]; then
    LOAD_FLAG="--load"
  else
    LOAD_FLAG=""
  fi

  run "docker build $LOAD_FLAG -t $WBS_TOOLS_IMAGE $WBS_TOOLS_PROJECT_DIR"
}

prepare_installer_runtime() {
  if $DEV; then
    build_installer_runtime
  else
    run "docker pull $WBS_TOOLS_IMAGE"
  fi
}

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
    node dist/cli.js
}

echo
echo "🔧 Starting command-line installer..."
echo

debug "Starting installer runtime container..."
prepare_installer_runtime
run_cli_config
