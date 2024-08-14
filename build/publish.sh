#!/usr/bin/env bash

# !!! 
# Note: This script is currently not in use. Multi-platform builds cannot be stored locally, but only
# in a Docker registry, so we currently add the appropriate tags and push to the registry at build
# time in build.sh. 
# !!!!

# publish.sh: Sets up and pushes the tags for a specified image which is assumed to be in
# available locally.

# Change to the directory where the script is located
cd "$(dirname "${BASH_SOURCE[0]}")" || exit

if [ "$#" -lt 1 ]; then
		echo "Usage: $0 <image-name> <--dry-run>"
		exit 1
fi

# Change to the directory for the specified project
cd "$1" || { echo "Failed to change directory to $1"; exit 1; }

# Remove the first argument, leaving the rest for docker buildx build
shift

DRY_RUN=${NX_DRY_RUN:-false}

BUILD_ENV_FILE="build.env"

IMAGE_NAME=$(jq -r '.name' package.json)
IMAGE_URL="${IMAGE_REGISTRY:-dockerhub.io}/${IMAGE_NAMESPACE:-wikibase}/${IMAGE_NAME?}"
LOCAL_IMAGE_URL="${IMAGE_NAMESPACE:-wikibase}/${IMAGE_NAME?}"

IMAGE_VERSION=$(jq -r '.version' package.json)
IMAGE_VERSION_MAJOR=$(echo "$IMAGE_VERSION" | cut -d '.' -f 1)
IMAGE_VERSION_MINOR=$(echo "$IMAGE_VERSION" | cut -d '.' -f 1,2)

# Source the environment file for IMAGE_TAGS
# shellcheck disable=SC1090
source $BUILD_ENV_FILE
TAGS=(
  "${IMAGE_VERSION}"
  "${IMAGE_VERSION_MAJOR}"
  "${IMAGE_VERSION_MINOR}"
  "${IMAGE_TAGS[@]}"
)

for TAG in "${TAGS[@]}"; do
  if [ "$DRY_RUN" == true ]; then
    echo "\"${LOCAL_IMAGE_URL}":latest\" would be tagged and pushed to \""${IMAGE_URL}:${TAG}\" (dry-run)"
  else
    docker tag "${LOCAL_IMAGE_URL}":latest "${IMAGE_URL}:${TAG}"
    docker push "${IMAGE_URL}:${TAG}"
  fi
done
