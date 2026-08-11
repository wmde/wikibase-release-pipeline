#!/usr/bin/env bash

# Internal host boundary for the containerized WBS tools application.

# The initial tools container is the privileged installer/lifecycle controller.
# Network-facing installer services are launched later without this socket.
prepare_wbs_tools_container_args() {
  WBS_TOOLS_CONTAINER_ARGS=(--rm)

  local variable_name
  local variable_names=(
    COMPOSE_PROJECT_NAME
    BUILD_CACHE_REGISTRY
    CERTBOT_IMAGE
    CERT_EMAIL
    GITHUB_ACTIONS
    LAUNCH_TRIGGER_PATH
    SERVER_IP
    WBS_BUILD_IMAGES
    WBS_LOCAL_IMAGES
    WBS_STATE_DIR
    WBS_TOOLS_ENV_PASSTHROUGH
    WBS_TOOLS_IMAGE
    WBS_INSTALLER_ACCESS_CODE
    WBS_INSTALLER_CONTAINER_NAME
    WBS_INSTALLER_PORT
    WBS_INSTALLER_WORKER_CONTAINER_NAME
    WBS_DEV_IMAGE
  )
  # This is an explicit list of additional environment variable names, not values.
  # shellcheck disable=SC2206
  local passthrough_names=( ${WBS_TOOLS_ENV_PASSTHROUGH:-} )
  variable_names+=( "${passthrough_names[@]}" )
  for variable_name in "${variable_names[@]}"; do
    if [[ -v "$variable_name" ]]; then
      WBS_TOOLS_CONTAINER_ARGS+=(-e "$variable_name")
    fi
  done

  WBS_TOOLS_CONTAINER_ARGS+=(
    -e "WBS_DIR=$WBS_DIR"
    -e "ENV_FILE_PATH=$ENV_FILE_PATH"
    -e "WBS_LOG_PATH=$WBS_LOG_PATH"
    -e "INSTALLATION_LOG_PATH=$INSTALLATION_LOG_PATH"
    -v /var/run/docker.sock:/var/run/docker.sock
    -v "$WBS_DIR:$WBS_DIR"
    -w "$WBS_DIR"
  )
}

# Image selection comes from the checkout's version files or an explicit
# caller override; this layer only makes that selected image available.
ensure_wbs_tools_image() {
  local failure_hint="${1:-}"
  if docker image inspect "$WBS_TOOLS_IMAGE" >/dev/null 2>&1; then
    return
  fi
  if [[ "${WBS_TOOLS_SKIP_PULL:-false}" == true ]]; then
    status "⛔️ Required local image $WBS_TOOLS_IMAGE was not found"
    return 1
  fi
  if ! run_args docker pull "$WBS_TOOLS_IMAGE"; then
    status "⛔️ Could not pull $WBS_TOOLS_IMAGE.$failure_hint" "tools_pull_failed"
    return 1
  fi
}

run_wbs_tools_command() {
  local tty_flags=()
  if [[ -t 0 && -t 1 ]]; then
    tty_flags=(-it)
  else
    tty_flags=(-i)
  fi
  prepare_wbs_tools_container_args
  exec docker run "${tty_flags[@]}" \
    "${WBS_TOOLS_CONTAINER_ARGS[@]}" \
    "$WBS_TOOLS_IMAGE" \
    node /app/dist/wbs.js "$@"
}

# Installation alone may prepare host dependencies or build source images.
# Other lifecycle commands only launch the already-selected tools image.
prepare_install_runtime() {
  local docker_was_missing=false
  if ! command -v docker >/dev/null 2>&1; then
    docker_was_missing=true
  fi

  # shellcheck disable=SC1091
  source "$SCRIPTS_DIR/install-docker.sh"
  if [[ "${WBS_DOCKER_BOOTSTRAPPED:-false}" != true &&
    "${WBS_SKIP_DEPENDENCY_INSTALLS:-false}" != true ]]; then
    install_docker
  fi
  confirm_docker_version
  confirm_docker_compose_version
  if [[ "${WBS_DOCKER_BOOTSTRAPPED:-false}" != true ]]; then
    confirm_docker_running
  fi
  if [[ "$docker_was_missing" == true ]]; then
    status "✅ Docker installed"
  fi
}

prepare_source_tools_image() {
  status "🕐 Building the WBS tools image from the selected source checkout..." "tools_build_started"
  if ! run_args "$WBS_DIR/development/wbs-dev" build wbs-tools; then
    status "⛔️ The WBS tools image build failed. Review $WBS_LOG_PATH or rerun with --debug." "tools_build_failed"
    exit 1
  fi
  status "✅ The source checkout's WBS tools image is ready." "tools_build_ready"

  export WBS_TOOLS_IMAGE="wikibase/wbs-tools:latest"
  export WBS_TOOLS_SKIP_PULL=true
  export WBS_BUILD_IMAGES=true
  export WBS_LOCAL_IMAGES=true
}

prepare_install() {
  local from_source=false
  local argument
  for argument in "$@"; do
    if [[ "$argument" == --from-source ]]; then
      from_source=true
    fi
  done

  prepare_install_runtime
  if [[ "$from_source" == true ]]; then
    prepare_source_tools_image
  fi
}

main() {
  SCRIPTS_DIR="${SCRIPTS_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
  WBS_DIR="${WBS_DIR:-$(cd "$SCRIPTS_DIR/.." && pwd)}"
  export WBS_DIR SCRIPTS_DIR
  if [[ -f "$WBS_DIR/local.env" ]]; then
    set -a
    # local.env is an operator-owned, shell-compatible override file.
    # shellcheck disable=SC1091
    source "$WBS_DIR/local.env"
    set +a
  fi
  export WBS_STATE_DIR="${WBS_STATE_DIR:-$WBS_DIR/.wbs}"
  export ENV_FILE_PATH="${ENV_FILE_PATH:-$WBS_DIR/.env}"
  export WBS_LOG_PATH="${WBS_LOG_PATH:-$WBS_STATE_DIR/logs/wbs.log}"
  export INSTALLATION_LOG_PATH="${INSTALLATION_LOG_PATH:-$WBS_STATE_DIR/logs/installation.log}"
  # shellcheck disable=SC1091
  source "$SCRIPTS_DIR/_logging.sh"
  # shellcheck disable=SC1091
  source "$SCRIPTS_DIR/_versions.sh"

  if [[ "${1:-}" == install ]]; then
    case "${2:-}" in
      configure|prepare|worker) ;;
      *) prepare_install "${@:2}" ;;
    esac
  fi
  ensure_wbs_tools_image " For an unpublished source checkout, rerun wbs install with --from-source."
  run_wbs_tools_command "$@"
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  set -euo pipefail
  main "$@"
fi
