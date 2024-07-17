#!/usr/bin/env bash

# Extract image_name from SKAFFOLD_IMAGE
image_repository="${SKAFFOLD_IMAGE%%/*}"
image_name_and_tag="${SKAFFOLD_IMAGE#*/}"
image_name="${image_name_and_tag%%:*}"

# Get version tags for the image name
source ./versions.inc.sh
mapfile -t tags < <(version_tags "$image_name")
# Tag the image with each version tag
for tag in "${tags[@]}"; do
    echo "Tagging image: $image_repository/$image_name:$tag"
    docker tag "$SKAFFOLD_IMAGE" "$image_repository/$image_name:$tag"
done
