#!/usr/bin/env bash

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
