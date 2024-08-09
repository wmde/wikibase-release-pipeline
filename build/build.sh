#!/bin/bash

# Change to the directory where the script is located
cd "$(dirname "${BASH_SOURCE[0]}")" || exit

if [ "$#" -lt 1 ]; then
		echo "Usage: $0 <directory> <--dry-run> [docker buildx build arguments...]"
		exit 1
fi

# Change to the directory for the specified project
cd "$1" || { echo "Failed to change directory to $1"; exit 1; }

# Remove the first argument, leaving the rest for docker buildx build
shift

DRY_RUN=false
PROVIDED_BUILD_OPTIONS=()

for arg in "$@"; do
	if [ "$arg" == "--dry-run" ]; then
		DRY_RUN=true
	else
		PROVIDED_BUILD_OPTIONS+=("$arg")
	fi
done

BUILD_ARGS=()
BUILD_ENV_FILE="build.env"

IMAGE_NAME=$(jq -r '.name' package.json)

# Setup for push to GHCR if running in CI
if [ "$GITHUB_ACTIONS" == true ]; then
	IMAGE_REGISTRY=ghcr.io
  IMAGE_NAMESPACE="${GITHUB_REPOSITORY_OWNER}/wikibase"
	BASE_TAG="dev-${GITHUB_RUN_ID}"
else
	# When not tagging anything but the image name the "latest" tag is by default applied
	# choosing to make that explicit here:
	BASE_TAG="latest"
fi

IMAGE_URL=${IMAGE_REGISTRY+${IMAGE_REGISTRY}/}${IMAGE_NAMESPACE:-wikibase}/${IMAGE_NAME}

# Extract --build-args from environment variables (excluding IMAGE_TAGS)
while IFS='=' read -r key value; do
	# Skip if the line is empty or the key is IMAGE_TAGS
	[ -z "$key" ] || [[ "$key" == IMAGE_TAGS ]] && continue

	if [ -n "$value" ]; then
		BUILD_ARGS+=("--build-arg" "$key=$value")
	fi
done < <(grep -E '^[A-Z_]+=.*' $BUILD_ENV_FILE)

BUILD_COMMAND="docker buildx build ${BUILD_ARGS[*]} ${PROVIDED_BUILD_OPTIONS[*]} --tag ${IMAGE_URL}:${BASE_TAG} ."

if [ "$DRY_RUN" == true ]; then
	echo "$BUILD_COMMAND" "(Dry-run: no build ran)"
else
	exec $BUILD_COMMAND
fi
