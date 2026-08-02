#!/usr/bin/env bash

set -euo pipefail

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"
# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_versions.sh"

prepare_tools_image() {
  local tools_project_dir="$WBS_DIR/development/images/wbs-tools"

  if [[ "${DEV:-false}" == true ]]; then
    debug "Building WBS tools from $tools_project_dir"
    run_args docker buildx build --load --tag "$WBS_TOOLS_IMAGE" "$tools_project_dir"
  elif [[ "${WBS_TOOLS_SKIP_PULL:-false}" != true ]]; then
    run_args docker pull "$WBS_TOOLS_IMAGE"
  elif ! docker image inspect "$WBS_TOOLS_IMAGE" >/dev/null 2>&1; then
    status "⛔️ Required local image $WBS_TOOLS_IMAGE was not found"
    return 1
  fi
}
