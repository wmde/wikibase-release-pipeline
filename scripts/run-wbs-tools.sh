#!/usr/bin/env bash

# Internal host boundary for the containerized WBS tools application.

prepare_wbs_tools_environment_args() {
  WBS_TOOLS_ENVIRONMENT_ARGS=()
  local variable_name
  local variable_names="COMPOSE_PROJECT_NAME BUILD_CACHE_REGISTRY GITHUB_ACTIONS ${WBS_TOOLS_ENV_PASSTHROUGH:-}"
  for variable_name in $variable_names; do
    if [[ -v "$variable_name" ]]; then
      WBS_TOOLS_ENVIRONMENT_ARGS+=(-e "$variable_name")
    fi
  done
}

run_wbs_tools_validation() {
  docker run --rm \
    -e WBS_VALIDATE_OPTIONS=true \
    "$WBS_TOOLS_IMAGE" \
    node dist/wbs.js "$@"
}

run_wbs_tools_command() {
  local tty_flags=()
  if [[ -t 0 && -t 1 ]]; then
    tty_flags=(-it)
  else
    tty_flags=(-i)
  fi
  prepare_wbs_tools_environment_args
  exec docker run "${tty_flags[@]}" --rm \
    "${WBS_TOOLS_ENVIRONMENT_ARGS[@]}" \
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

run_install_or_configure() {
  local command="$1"
  shift
  local request_args=( "$@" )
  local configure_args=()
  local from_source=false
  local cli=true
  local show_help=false
  local argument

  for argument in "${request_args[@]}"; do
    case "$argument" in
      --web)
        cli=false
        configure_args+=( "$argument" )
        ;;
      --local)
        export LOCALHOST=true
        configure_args+=( "$argument" )
        ;;
      --debug)
        export DEBUG=true
        configure_args+=( "$argument" )
        ;;
      --from-source)
        from_source=true
        ;;
      -h|--help)
        show_help=true
        configure_args+=( "$argument" )
        ;;
      *)
        configure_args+=( "$argument" )
        ;;
    esac
  done

  if [[ "$command" == configure && "$from_source" == true ]]; then
    echo "wbs: --from-source belongs to 'wbs install', not 'wbs configure'." >&2
    exit 1
  fi

  if [[ "$command" == install ]]; then
    prepare_runtime true
  else
    prepare_runtime false
  fi

  if [[ "$command" == install && "$from_source" == true ]]; then
    prepare_source_tools_image
  else
    prepare_wbs_tools_image
  fi

  if [[ "$show_help" == true ]]; then
    exec docker run --rm "$WBS_TOOLS_IMAGE" \
      node dist/wbs.js "$command" "${request_args[@]}"
  fi

  run_wbs_tools_validation "$command" "${request_args[@]}"

  if [[ "$command" == configure ]]; then
    export CONFIGURE_ONLY=true
  fi

  if [[ "$cli" == true ]]; then
    run_wbs_tools_command "$command" "${request_args[@]}"
  fi

  exec bash "$SCRIPTS_DIR/run-web-installer.sh" "${configure_args[@]}"
}

main() {
  SCRIPTS_DIR="${SCRIPTS_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
  WBS_DIR="${WBS_DIR:-$(cd "$SCRIPTS_DIR/.." && pwd)}"
  export WBS_DIR SCRIPTS_DIR
  export WBS_STATE_DIR="${WBS_STATE_DIR:-$WBS_DIR/.wbs}"
  export ENV_FILE_PATH="${ENV_FILE_PATH:-$WBS_DIR/.env}"
  export LOG_PATH="${LOG_PATH:-$WBS_DIR/installation.log}"
  export DEBUG="${DEBUG:-false}"
  export INSTALLER_DEV=false
  export INSTALLER_DEV_MOCK=false
  export LOCALHOST=false
  export CONFIGURE_ONLY=false
  export WBS_BUILD_IMAGES=false
  SKIP_DEPENDENCY_INSTALLS="${WBS_SKIP_DEPENDENCY_INSTALLS:-false}"

  # shellcheck disable=SC1091
  source "$SCRIPTS_DIR/_logging.sh"
  # shellcheck disable=SC1091
  source "$SCRIPTS_DIR/install-docker.sh"
  # shellcheck disable=SC1091
  source "$SCRIPTS_DIR/_tools-image.sh"

  local command="${1:-}"
  case "$command" in
    up|down|status|reset)
      prepare_runtime false
      prepare_wbs_tools_image
      run_wbs_tools_command "$@"
      ;;
    install|configure)
      run_install_or_configure "$@"
      ;;
  esac

  # Commands implemented entirely by the tools application retain the generic
  # container entry point. This also renders help when no command was supplied.
  prepare_runtime false
  prepare_wbs_tools_image
  run_wbs_tools_command "$@"
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  set -euo pipefail
  main "$@"
fi
