#!/usr/bin/env bash

set -euo pipefail

export WBS_DIR
export SCRIPTS_DIR
export WBS_STATE_DIR
export ENV_FILE_PATH

export DEBUG="${DEBUG:-false}"
export INSTALLER_DEV=false
export INSTALLER_DEV_MOCK=false
export LOCALHOST=false
export RESET=false
export SKIP_LAUNCH=false
export SKIP_DEPENDENCY_INSTALLS="${WBS_SKIP_DEPENDENCY_INSTALLS:-false}"
export CONFIGURE_ONLY=false
export WBS_BUILD_IMAGES=false

COMMAND="${1:-}"

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"
# shellcheck disable=SC1091
source "$SCRIPTS_DIR/install-docker.sh"
# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_tools-image.sh"

prepare_runtime() {
  local install_dependencies="$1"
  if [[ "$install_dependencies" == true && "$SKIP_DEPENDENCY_INSTALLS" != true ]]; then
    install_docker
  fi
  if [[ "${WBS_SKIP_ARCH_CHECK:-false}" != true ]]; then
    confirm_arch
  fi
  confirm_docker_version
  confirm_docker_compose_version
  confirm_docker_running
  status "✅ Docker installed"
}

prepare_source_tools_image() {
  status "🕐 Building the WBS tools image from the selected source checkout..." "tools_build_started"
  if ! run_args "$WBS_DIR/development/wbs-dev" build wbs-tools; then
    status "⛔️ The WBS tools image build failed. Review $LOG_PATH or rerun with --debug." "tools_build_failed"
    exit 1
  fi
  status "✅ The source checkout's WBS tools image is ready." "tools_build_ready"

  export WBS_TOOLS_IMAGE="wikibase/wbs-tools:latest"
  export WBS_TOOLS_SKIP_PULL=true
  export WBS_BUILD_IMAGES=true
  export WBS_LOCAL_IMAGES=true
}

run_tools_validation() {
  docker run --rm \
    -e WBS_VALIDATE_OPTIONS=true \
    "$WBS_TOOLS_IMAGE" \
    node dist/wbs.js "$@"
}

run_tools_command() {
  local tty_flags=()
  local environment_args=()
  if [[ -t 0 && -t 1 ]]; then
    tty_flags=(-it)
  else
    tty_flags=(-i)
  fi
  for variable_name in \
    COMPOSE_PROJECT_NAME BUILD_CACHE_REGISTRY GITHUB_ACTIONS \
    WBS_E2E_PULL_POLICY WBS_E2E_HTTP_PORT WBS_E2E_HTTPS_PORT \
    WBS_TEST_IMAGE_REGISTRY WBS_TEST_IMAGE_TAG; do
    if [[ -v "$variable_name" ]]; then
      environment_args+=(-e "$variable_name")
    fi
  done
  exec docker run "${tty_flags[@]}" --rm \
    "${environment_args[@]}" \
    -e WBS_DIR="$WBS_DIR" \
    -e ENV_FILE_PATH="$ENV_FILE_PATH" \
    -e LOG_PATH="$WBS_DIR/installation.log" \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v "$WBS_DIR:$WBS_DIR" \
    -v "$WBS_DIR:/app/wbs" \
    -w "$WBS_DIR" \
    "$WBS_TOOLS_IMAGE" \
    node /app/dist/wbs.js "$@"
}

case "$COMMAND" in
  up|down|status|reset)
    prepare_runtime false
    prepare_wbs_tools_image
    run_tools_command "$@"
    ;;
esac

if [[ "$COMMAND" == install || "$COMMAND" == configure ]]; then
  shift
  REQUEST_ARGS=( "$@" )
  CONFIGURE_ARGS=()
  FROM_SOURCE=false

  for argument in "${REQUEST_ARGS[@]}"; do
    case "$argument" in
      --web)
        export CLI=false
        CONFIGURE_ARGS+=( "$argument" )
        ;;
      --local)
        export LOCALHOST=true
        CONFIGURE_ARGS+=( "$argument" )
        ;;
      --debug)
        export DEBUG=true
        CONFIGURE_ARGS+=( "$argument" )
        ;;
      --from-source)
        FROM_SOURCE=true
        ;;
      --installer-dev|--dev)
        echo "⚠️ Installer development has moved. Run ./development/wbs-dev installer-dev web."
        exit 1
        ;;
      -h|--help)
        SHOW_HELP=true
        CONFIGURE_ARGS+=( "$argument" )
        ;;
      *)
        CONFIGURE_ARGS+=( "$argument" )
        ;;
    esac
  done
  export CLI="${CLI:-true}"

  if [[ "$COMMAND" == configure && "$FROM_SOURCE" == true ]]; then
    echo "wbs: --from-source belongs to 'wbs install', not 'wbs configure'." >&2
    exit 1
  fi

  if [[ "$COMMAND" == install ]]; then
    prepare_runtime true
  else
    prepare_runtime false
  fi

  if [[ "$COMMAND" == install && "$FROM_SOURCE" == true ]]; then
    prepare_source_tools_image
  else
    prepare_wbs_tools_image
  fi

  if [[ "${SHOW_HELP:-false}" == true ]]; then
    exec docker run --rm "$WBS_TOOLS_IMAGE" \
      node dist/wbs.js "$COMMAND" "${REQUEST_ARGS[@]}"
  fi

  run_tools_validation "$COMMAND" "${REQUEST_ARGS[@]}"

  if [[ "$COMMAND" == configure ]]; then
    export CONFIGURE_ONLY=true
    export SKIP_LAUNCH=true
  fi

  if [[ "$CLI" == true ]]; then
    run_tools_command "$COMMAND" "${REQUEST_ARGS[@]}"
  fi

  exec bash "$SCRIPTS_DIR/run-web-installer.sh" "${CONFIGURE_ARGS[@]}"
fi

# Commands implemented entirely by the tools application retain the generic
# container entry point. This also renders top-level help when no command was
# supplied.
prepare_runtime false
prepare_wbs_tools_image
run_tools_command "$@"
