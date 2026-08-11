#!/usr/bin/env bash

# Resolve the WBS Tools image selected for this checkout. A caller-provided
# image wins; otherwise the release manifest and optional installer selection
# are loaded in precedence order.
if [[ -z "${WBS_TOOLS_IMAGE:-}" ]]; then
  # shellcheck disable=SC1091
  source "$WBS_DIR/.wbs/version"
  if [[ -f "$WBS_DIR/.wbs/install.env" ]]; then
    # Generated from an installation manifest. An explicit environment value
    # or local.env still takes precedence over this persisted selection.
    # shellcheck disable=SC1091
    source "$WBS_DIR/.wbs/install.env"
  fi
fi
export WBS_TOOLS_IMAGE
