#!/usr/bin/env bash

if [[ -z "${WBS_TOOLS_IMAGE:-}" ]]; then
  # shellcheck disable=SC1091
  source "$WBS_DIR/.wbs/version"
fi
export WBS_TOOLS_IMAGE
