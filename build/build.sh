#!/usr/bin/env bash

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <directory> [docker buildx bake arguments...]"
    exit 1
fi

# Change to the specified directory
cd "$1" || { echo "Failed to change directory to $1"; exit 1; }

# Remove the first argument, leaving the rest for docker buildx bake
shift

DEFAULT_IMAGE_NAMESPACE=wikibase

if [ -z "${IMAGE_NAMESPACE+x}" ]; then
  export IMAGE_NAMESPACE="$DEFAULT_IMAGE_NAMESPACE"
fi

IMAGE_NAME=$(jq -r '.name' package.json)
IMAGE_VERSION=$(jq -r '.version' package.json)
IMAGE_VERSION_MAJOR=$(echo "$IMAGE_VERSION" | cut -d '.' -f 1)
IMAGE_VERSION_MINOR=$(echo "$IMAGE_VERSION" | cut -d '.' -f 1,2)
# Optionally parse with grep and sed in a way that works on both Darwin and Linux without the extra jq dep,
# e.g.: IMAGE_VERSION=$(grep '"version"' package.json | sed -E 's/.*"version":\s*"([^"]+)".*/\1/')

export IMAGE_NAME
export IMAGE_VERSION
export IMAGE_VERSION_MAJOR
export IMAGE_VERSION_MINOR
export IMAGE_NAMESPACE=wikibase

set -o allexport
# shellcheck disable=SC1091
source build.env
set +o allexport

# Build the Docker image using docker buildx
exec docker buildx bake "$@"
