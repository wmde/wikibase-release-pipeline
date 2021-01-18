#!/bin/bash
set -e

SERVICE_DIST_TAR="$TARBALL_PATH"

cp "$SERVICE_DIST_TAR" Docker/build/QueryService/
docker build --pull --build-arg tarball="$(basename "$SERVICE_DIST_TAR")" Docker/build/QueryService/ -t "$1"

docker save "$1" | gzip -9f > artifacts/"$1".docker.tar.gz
