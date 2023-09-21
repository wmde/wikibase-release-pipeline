#!/usr/bin/env bash
set -ex

image_name="$1"

mkdir -p Docker/build/QuickStatements/artifacts
cp "$TARBALL_PATH" Docker/build/QuickStatements/artifacts/

docker build \
    --build-arg COMPOSER_IMAGE_NAME="$COMPOSER_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_VERSION="$COMPOSER_IMAGE_VERSION" \
    --no-cache \
    -t "$image_name" \
    Docker/build/QuickStatements/

build/docker_tag.sh "$image_name"

# TODO: this saves all the images from the local registry, all builds, not just the latest build
docker save \
    "$image_name" \
    "${DOCKER_REPOSITORY_NAME}/${image_name}" \
    "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}" \
    | gzip -"$GZIP_COMPRESSION_RATE" \
    > "$(pwd)/artifacts/${image_name}.docker.tar.gz"
