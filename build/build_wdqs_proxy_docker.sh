#!/usr/bin/env bash
set -ex

image_name="$1"

docker build \
    -t "$image_name" \
    Docker/build/WDQS-proxy/

build/docker_tag.sh "$image_name"

docker save \
    "$image_name" \
    "${DOCKER_REPOSITORY_NAME}/${image_name}" \
    "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}" \
    | gzip -"$GZIP_COMPRESSION_RATE" \
    > "$(pwd)/artifacts/${image_name}.docker.tar.gz"
