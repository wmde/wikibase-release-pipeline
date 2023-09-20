#!/usr/bin/env bash
set -e

image_name="$1"

SERVICE_DIST_TAR="$TARBALL_PATH"

cp "$SERVICE_DIST_TAR" Docker/build/WDQS/
cp Docker/build/wait-for-it.sh Docker/build/WDQS/

docker build \
    --pull \
    --build-arg tarball="$(basename "$SERVICE_DIST_TAR")" \
    -t "$image_name" \
    Docker/build/WDQS/ 

build/docker_tag.sh "$image_name"

docker save \
    "$image_name" \
    "${DOCKER_REPOSITORY_NAME}/${image_name}" \
    "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}" \
    | gzip -"$GZIP_COMPRESSION_RATE" \
    > "$(pwd)/artifacts/${image_name}.docker.tar.gz"
