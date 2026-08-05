#!/usr/bin/env bash

set -euo pipefail

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"
# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_versions.sh"

require_wbs_tools_image() {
  if ! docker image inspect "$WBS_TOOLS_IMAGE" >/dev/null 2>&1; then
    status "⛔️ Required local image $WBS_TOOLS_IMAGE was not found"
    return 1
  fi
}

update_wbs_tools_image() {
  local failure_hint="${1:-}"
  if [[ "${WBS_TOOLS_SKIP_PULL:-false}" == true ]]; then
    require_wbs_tools_image
    return
  fi
  if ! run_args docker pull "$WBS_TOOLS_IMAGE"; then
    status "⛔️ Could not pull $WBS_TOOLS_IMAGE.$failure_hint" "tools_pull_failed"
    return 1
  fi
}
