#!/usr/bin/env bash

set -euo pipefail

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"
# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_versions.sh"

prepare_tools_image() {
  local tools_project_dir="$WBS_DIR/development/images/wbs-tools"

  if [[ "${DEV:-false}" == true || "${BUILD:-false}" == true ]]; then
    local tools_version
    tools_version="$(sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$tools_project_dir/package.json" | head -n 1)"
    status "Building WBS tools from the selected source checkout..." "tools_build_started"
    debug "Building WBS tools from $tools_project_dir"
    run_args docker buildx build \
      --load \
      --tag "$WBS_TOOLS_IMAGE" \
      --build-arg "WBS_TOOLS_VERSION=$tools_version" \
      "$tools_project_dir"
    status "✅ WBS tools build is current." "tools_build_ready"
  elif [[ "${WBS_TOOLS_SKIP_PULL:-false}" != true ]]; then
    if ! run_args docker pull "$WBS_TOOLS_IMAGE"; then
      status "⛔️ Could not pull $WBS_TOOLS_IMAGE. For an unpublished source checkout, rerun with --build." "tools_pull_failed"
      return 1
    fi
  elif ! docker image inspect "$WBS_TOOLS_IMAGE" >/dev/null 2>&1; then
    status "⛔️ Required local image $WBS_TOOLS_IMAGE was not found"
    return 1
  fi
}
