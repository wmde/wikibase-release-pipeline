#!/usr/bin/env bash

# Always load the checkout's release metadata. The checked-in tools image is
# the default, an installer manifest may pin a preview image, and an explicit
# caller selection remains the final escape hatch.
explicit_wbs_tools_image="${WBS_TOOLS_IMAGE:-}"
if [[ -f "$WBS_DIR/.wbs/version" ]]; then
  # shellcheck disable=SC1091
  source "$WBS_DIR/.wbs/version"
elif [[ -z "$explicit_wbs_tools_image" ]]; then
  echo "Wikibase Suite release metadata was not found at $WBS_DIR/.wbs/version." >&2
  return 1
fi
if [[ -f "$WBS_DIR/.wbs/install.env" ]]; then
  # shellcheck disable=SC1091
  source "$WBS_DIR/.wbs/install.env"
fi
if [[ -n "$explicit_wbs_tools_image" ]]; then
  WBS_TOOLS_IMAGE="$explicit_wbs_tools_image"
fi
unset explicit_wbs_tools_image
export WBS_TOOLS_IMAGE
if [[ -n "${WBS_VERSION:-}" ]]; then
  export WBS_VERSION
fi
