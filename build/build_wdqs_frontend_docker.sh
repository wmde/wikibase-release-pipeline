#!/bin/sh
set -e

image_name="$1"

cp -r "$TARBALL_PATH" Docker/build/WDQS-frontend

docker build \
    --pull \
    --build-arg tarball="$(basename "$TARBALL_PATH")" \
    -t "$image_name" \
    Docker/build/WDQS-frontend/

build/docker_tag.sh "$image_name"

docker save \
    "$image_name" \
    "${DOCKER_REPOSITORY_NAME}/${image_name}" \
    "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}" \
    | gzip -"$GZIP_COMPRESSION_RATE" \
    > "$(pwd)"/artifacts/${image_name}.docker.tar.gz
