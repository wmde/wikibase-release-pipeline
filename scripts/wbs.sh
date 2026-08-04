#!/usr/bin/env bash

set -euo pipefail

export WBS_DIR
export SCRIPTS_DIR
export WBS_STATE_DIR
export ENV_FILE_PATH

export DEBUG="${DEBUG:-false}"
export FROM_SOURCE=false
export INSTALLER_DEV=false
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
      --from-source)
        export FROM_SOURCE=true
        ;;
      --installer-dev|--dev)
        echo "⚠️ Installer development has moved. Run ./development/wbs-dev installer-dev web."
        exit 1
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
if [[ "${WBS_SKIP_ARCH_CHECK:-false}" != true ]]; then
  confirm_arch
fi
confirm_docker_version
confirm_docker_compose_version
confirm_docker_running
status "✅ Docker installed"

if $FROM_SOURCE; then
  status "🕐 Building Wikibase Suite images from the selected source checkout..." "images_build_started"
  if ! run_args "$WBS_DIR/development/wbs-dev" build; then
    status "⛔️ One or more image builds failed. Review $LOG_PATH or rerun with --debug." "images_build_failed"
    exit 1
  fi
  status "✅ All source image builds are current." "images_build_ready"

  mkdir -p "$WBS_STATE_DIR"
  touch "$WBS_STATE_DIR/local-images"
  export WBS_TOOLS_IMAGE="wikibase/wbs-tools:latest"
  status "Locally built images remain selected for this checkout. Remove .wbs/local-images to return to published images." "source_build_images_selected"
else
  prepare_wbs_tools_image
fi

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

exec bash "$SCRIPTS_DIR/run-installer.sh" "${INSTALL_ARGS[@]}"
