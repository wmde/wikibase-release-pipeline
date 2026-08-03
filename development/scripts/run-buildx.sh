#!/usr/bin/env bash

set -euo pipefail

usage() {
	echo "Usage: $0 --cache-name NAME --builder-name NAME --context PATH [--dry-run] [--silent] -- [docker buildx build arguments...]"
	exit 1
}

CACHE_NAME=""
BUILDER_NAME=""
BUILD_CONTEXT=""
DRY_RUN=false
SILENT=false

while [[ $# -gt 0 ]]; do
	case "$1" in
		--cache-name)
			[[ -n "${2:-}" ]] || usage
			CACHE_NAME=$2
			shift 2
			;;
		--builder-name)
			[[ -n "${2:-}" ]] || usage
			BUILDER_NAME=$2
			shift 2
			;;
		--context)
			[[ -n "${2:-}" ]] || usage
			BUILD_CONTEXT=$2
			shift 2
			;;
		--dry-run)
			DRY_RUN=true
			shift
			;;
		--silent)
			SILENT=true
			shift
			;;
		--)
			shift
			break
			;;
		*)
			usage
			;;
	esac
done

[[ -n "$CACHE_NAME" && -n "$BUILDER_NAME" && -n "$BUILD_CONTEXT" ]] || usage

BUILD_ARGS=("$@")
NO_CACHE=false
TARGET_PLATFORMS=""
PREVIOUS_ARG=""

for arg in "${BUILD_ARGS[@]}"; do
	if [[ "$PREVIOUS_ARG" == "--platform" ]]; then
		TARGET_PLATFORMS=$arg
	elif [[ "$arg" == --platform=* ]]; then
		TARGET_PLATFORMS=${arg#--platform=}
	elif [[ "$arg" == "--no-cache" ]]; then
		NO_CACHE=true
	fi
	PREVIOUS_ARG=$arg
done

# Source builds use a shared registry cache when one is configured, in addition
# to BuildKit's local cache.
if [[ -n "${BUILD_CACHE_REGISTRY:-}" ]]; then
	CACHE_REGISTRY=${BUILD_CACHE_REGISTRY%/}
	CACHE_SCOPE=${BUILD_CACHE_SCOPE:-${TARGET_PLATFORMS:-$(docker info --format '{{.OSType}}-{{.Architecture}}')}}
	CACHE_SCOPE=${CACHE_SCOPE//\//-}
	CACHE_SCOPE=${CACHE_SCOPE//,/_}
	CACHE_SCOPE=${CACHE_SCOPE//aarch64/arm64}
	CACHE_SCOPE=${CACHE_SCOPE//x86_64/amd64}
	CACHE_REF="${CACHE_REGISTRY}/${CACHE_NAME}:buildcache-${CACHE_SCOPE}"
	LEGACY_CACHE_REF="${CACHE_REGISTRY}/${CACHE_NAME}:buildcache"

	BUILD_ARGS+=(--builder "$BUILDER_NAME")

	if [[ "$NO_CACHE" == false ]]; then
		# Read the former unscoped cache while platform-specific caches populate.
		# New cache records are written only to the platform-specific reference.
		BUILD_ARGS+=(
			--cache-from "type=registry,ref=${CACHE_REF}"
			--cache-from "type=registry,ref=${LEGACY_CACHE_REF}"
		)
	fi

	if [[ "${BUILD_CACHE_PUSH:-false}" == true ]]; then
		BUILD_ARGS+=(
			--cache-to "type=registry,ref=${CACHE_REF},mode=max,ignore-error=true"
		)
	fi
fi

BUILD_COMMAND=(docker buildx build "${BUILD_ARGS[@]}" "$BUILD_CONTEXT")

if [[ "$DRY_RUN" == true ]]; then
	echo "Dry-run. This is the build command which would run:"
	echo
	printf '%q ' "${BUILD_COMMAND[@]}"
	echo
	echo
	exit 0
fi

# Registry cache export requires a BuildKit container builder. Keep setup here
# so bootstrap, local product builds, and CI all use the same behavior.
if [[ -n "${BUILD_CACHE_REGISTRY:-}" ]]; then
	if ! docker buildx inspect "$BUILDER_NAME" >/dev/null 2>&1; then
		# Parallel image tasks may all observe a missing shared builder. One creates
		# it; the others can safely continue once that builder becomes visible.
		if ! builder_create_output=$(docker buildx create \
			--name "$BUILDER_NAME" \
			--driver docker-container 2>&1); then
			if ! docker buildx inspect "$BUILDER_NAME" >/dev/null 2>&1; then
				printf '%s\n' "$builder_create_output" >&2
				exit 1
			fi
		fi
	fi
	docker buildx inspect "$BUILDER_NAME" --bootstrap >/dev/null
fi

if [[ "$SILENT" == true ]]; then
	exec "${BUILD_COMMAND[@]}" >/dev/null
fi

exec "${BUILD_COMMAND[@]}"
