#!/bin/sh
set -e

cp -r "$TARBALL_PATH" Docker/build/WDQS-frontend

docker build \
    --pull \
    --build-arg tarball="$(basename "$TARBALL_PATH")" \
    -t wdqs-frontend \
    Docker/build/WDQS-frontend/

build/docker_tag.sh wdqs-frontend

docker save "$1" | gzip -"$GZIP_COMPRESSION_RATE"f > "$(pwd)"/artifacts/"$1".docker.tar.gz
