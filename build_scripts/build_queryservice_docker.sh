#!/bin/bash
set -e

SERVICE_DIST_TAR="$TARBALL_PATH"

mv "$SERVICE_DIST_TAR" DockerQueryService
docker build --build-arg tarball="$(basename "$SERVICE_DIST_TAR")" DockerQueryService/ -t "$1"

docker save "$1" | gzip -9f > "$1".docker.tar.gz
