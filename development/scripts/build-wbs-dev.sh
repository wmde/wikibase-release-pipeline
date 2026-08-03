#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

WBS_DEV_IMAGE=${WBS_DEV_IMAGE:-wbs-dev:latest}
BUILD_ARGS=(
	--file container/Dockerfile
	--load
	--quiet
	--tag "$WBS_DEV_IMAGE"
)

if [[ "${WBS_DEV_NO_CACHE:-false}" == true ]]; then
  BUILD_ARGS+=(--no-cache --pull)
fi

exec scripts/run-buildx.sh \
	--cache-name wbs-dev \
	--builder-name wbs-dev-builder \
	--context . \
	--silent \
	-- "${BUILD_ARGS[@]}"
