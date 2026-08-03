#!/usr/bin/env bash

set -euo pipefail

export WBS_DIR
export TOOLS_DIR
export SCRIPTS_DIR
export ENV_FILE_PATH

export DEBUG="${DEBUG:-false}"
export BUILD=false
export DEV=false
export LOCALHOST=false
export RESET=false
export SKIP_LAUNCH=false
export SKIP_DEPENDENCY_INSTALLS="${WBS_SKIP_DEPENDENCY_INSTALLS:-false}"

if [[ "${1:-}" == install ]]; then
  shift
  INSTALL_ARGS=( "$@" )

  for argument in "$@"; do
    case "$argument" in
      --web)
        export CLI=false
        ;;
      --local)
        export LOCALHOST=true
        ;;
      --debug)
        export DEBUG=true
        ;;
      --build)
        export BUILD=true
        ;;
      --dev)
        export DEV=true
        export CLI=false
        export LOCALHOST=true
        export SKIP_DEPENDENCY_INSTALLS=true
        ;;
      -h|--help)
        SHOW_HELP=true
        ;;
    esac
  done

  export CLI="${CLI:-true}"
fi

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"
# shellcheck disable=SC1091
source "$SCRIPTS_DIR/install-docker.sh"
# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_tools-image.sh"

if [[ "$SKIP_DEPENDENCY_INSTALLS" != true ]]; then
  install_docker
fi
if [[ "$DEV" != true && "${WBS_SKIP_ARCH_CHECK:-false}" != true ]]; then
  confirm_arch
fi
confirm_docker_version
confirm_docker_compose_version
confirm_docker_running
status "✅ Docker installed"

prepare_tools_image

if [[ -z "${INSTALL_ARGS+x}" ]]; then
  exec docker run --rm "$WBS_TOOLS_IMAGE" node dist/wbs.js "$@"
fi

if [[ "${SHOW_HELP:-false}" == true ]]; then
  exec docker run --rm "$WBS_TOOLS_IMAGE" \
    node dist/wbs.js install "${INSTALL_ARGS[@]}"
fi

docker run --rm \
  -e WBS_VALIDATE_OPTIONS=true \
  "$WBS_TOOLS_IMAGE" \
  node dist/wbs.js install "${INSTALL_ARGS[@]}"

if $BUILD; then
  bash "$SCRIPTS_DIR/build-images.sh"
fi

exec bash "$SCRIPTS_DIR/install.sh" "${INSTALL_ARGS[@]}"
