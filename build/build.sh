#!/bin/bash

# Change to the directory where the script is located
cd "$(dirname "${BASH_SOURCE[0]}")" || exit

if [ "$#" -lt 1 ]; then
		echo "Usage: $0 <directory> <--release-tag> <--dry-run> [docker buildx build arguments...]"
		exit 1
fi

# Change to the directory for the specified project
cd "$1" || { echo "Failed to change directory to $1"; exit 1; }

# Remove the first argument, leaving the rest for docker buildx build
shift

RELEASE_TAG=false
DRY_RUN=false
PROVIDED_BUILD_OPTIONS=()

for arg in "$@"; do
	if [ "$arg" == "--release-tag" ]; then
		RELEASE_TAG=true
	elif [ "$arg" == "--dry-run" ]; then
		DRY_RUN=true
	else
		PROVIDED_BUILD_OPTIONS+=("$arg")
	fi
done

BUILD_OPTIONS=()
BUILD_ENV_FILE="build.env"

IMAGE_NAME=$(jq -r '.name' package.json)
IMAGE_NAMESPACE="${IMAGE_NAMESPACE:-wikibase}"
IMAGE_URL=${IMAGE_REGISTRY+${IMAGE_REGISTRY}/}${IMAGE_NAMESPACE?}/${IMAGE_NAME?}

# Extract --build-args from environment variables (excluding IMAGE_TAGS)
while IFS='=' read -r key value; do
	# Skip if the line is empty or the key is IMAGE_TAGS
	[ -z "$key" ] || [[ "$key" == IMAGE_TAGS ]] && continue

	if [ -n "$value" ]; then
		BUILD_OPTIONS+=("--build-arg" "$key=$value")
	fi
done < <(grep -E '^[A-Z_]+=.*' $BUILD_ENV_FILE)

if [ "$RELEASE_TAG" == true ]; then
	IMAGE_VERSION=$(jq -r '.version' package.json)
	IMAGE_VERSION_MAJOR=$(echo "$IMAGE_VERSION" | cut -d '.' -f 1)
	IMAGE_VERSION_MINOR=$(echo "$IMAGE_VERSION" | cut -d '.' -f 1,2)
	VERSION_TAGS=("${IMAGE_VERSION_MAJOR}" "${IMAGE_VERSION_MINOR}" "${IMAGE_VERSION}")

	# Source the environment file to IMAGE_TAGS
	# shellcheck disable=SC1090
	source $BUILD_ENV_FILE
	COMBINED_TAGS=("${IMAGE_TAGS[@]}" "${VERSION_TAGS[@]}")

	if [ -n "${COMBINED_TAGS+x}" ]; then
		for tag in "${COMBINED_TAGS[@]}"; do
			BUILD_OPTIONS+=("--tag" "${IMAGE_URL}:${tag}")
		done
	fi
fi

DOCKER_CMD="docker buildx build ${BUILD_OPTIONS[*]} ${PROVIDED_BUILD_OPTIONS[*]} --tag ${IMAGE_URL} ."

if [ "$DRY_RUN" == true ]; then
	echo "$DOCKER_CMD" "(Dry-run: no build ran)"
else
	exec $DOCKER_CMD
fi
