#!/usr/bin/env bash
set -euo pipefail

# --- Expected Variables ---

export DEBUG
export LOCALHOST
export SKIP_DEPENDENCY_INSTALLS
export SKIP_LAUNCH
export DEPLOY_DIR
export ENV_FILE_PATH
export SCRIPTS_DIR
export SETUP_DIR

# --- Bootstrap Logging ---

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"

# --- Setup Phase ---

if $RESET; then
  echo
  if [[ -f "$ENV_FILE_PATH" ]]; then
    printf "Delete the current configuration found in .env? [y/N]: "
    read -n 1 -r reset_config
    echo
    case "${reset_config:-n}" in
      y|Y)
        rm -f "$ENV_FILE_PATH"
        ;;
    esac
    echo 
  fi

  printf "⛔️ Delete any existing wbs-deploy services AND data? [y/N]: "
  read -n 1 -r reset_data
  echo
  case "${reset_data:-n}" in
    y|Y)
      ;;
    *)
      export RESET=false
      ;;
  esac
  echo
fi

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
