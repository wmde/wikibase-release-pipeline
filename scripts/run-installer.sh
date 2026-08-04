#!/usr/bin/env bash
set -euo pipefail

# --- Expected Variables ---

export CLI
export INSTALLER_DEV
export DEBUG
export LOCALHOST
export SKIP_DEPENDENCY_INSTALLS
export SKIP_LAUNCH
export RESET
export WBS_DIR
export ENV_FILE_PATH
export LAUNCH_TRIGGER_PATH
export SCRIPTS_DIR
export WBS_STATE_DIR
INSTALL_ARGS=( "$@" )

# --- Bootstrap Logging ---

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"

prompt_to_show_saved_config() {
  if ! $CLI || [[ ! -t 0 ]] || [[ ! -f "$ENV_FILE_PATH" ]]; then
    return
  fi

  printf "Show the current saved configuration now, including passwords? [y/N]: "
  read -r show_config
  case "${show_config:-n}" in
    y|Y)
      echo
      echo "Saved configuration (.env):"
      echo
      sed 's/^/  /' "$ENV_FILE_PATH"
      echo
      ;;
  esac
}

# --- Installation Phase ---

if $RESET; then
  echo
  if [[ -f "$ENV_FILE_PATH" ]]; then
    printf "⛔️ Delete the current configuration found in .env? [y/N]: "
    read -n 1 -r reset_config
    case "${reset_config:-n}" in
      y|Y)
        rm -f "$ENV_FILE_PATH"
        ;;
    esac
    echo
  fi

  printf "⛔️ Delete any existing Wikibase Suite services AND data? [y/N]: "
  read -n 1 -r reset_data
  case "${reset_data:-n}" in
    y|Y)
      ;;
    *)
      export RESET=false
      ;;
  esac

  echo
  echo
fi

if $CLI; then
  bash "$SCRIPTS_DIR/run-cli-installer.sh" "${INSTALL_ARGS[@]}"
else
  export LAUNCH_TRIGGER_PATH="${LAUNCH_TRIGGER_PATH:-$WBS_DIR/.wbs-installer-launch-ready}"
  rm -f "$LAUNCH_TRIGGER_PATH"
  bash "$SCRIPTS_DIR/run-web-installer.sh" "${INSTALL_ARGS[@]}"
fi

# --- Launch or exit ---

if $SKIP_LAUNCH; then
  status "SKIP_LAUNCH=true; not starting services." "launch_skipped"
  prompt_to_show_saved_config
  exit 0
fi

# Detach to avoid accidental interruption of the launch process
if ! $CLI; then
  debug "Starting background process..."
  nohup env \
    WBS_DIR="$WBS_DIR" \
    WBS_STATE_DIR="$WBS_STATE_DIR" \
    LOG_PATH="$LOG_PATH" \
    INSTALLER_DEV="$INSTALLER_DEV" \
    DEBUG="$DEBUG" \
    LOCALHOST="$LOCALHOST" \
    LAUNCH_TRIGGER_PATH="$LAUNCH_TRIGGER_PATH" \
    RESET="$RESET" \
    bash "$SCRIPTS_DIR/launch-suite.sh" \
    >/dev/null 2>&1 &

  echo "It is now safe to close this terminal session."
  echo
else
  bash "$SCRIPTS_DIR/launch-suite.sh"
fi
