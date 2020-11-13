#!/bin/sh
SERVICE_DIST_TAR="$TARBALL_PATH"

mv "$SERVICE_DIST_TAR" ../DockerQueryService
docker build --build-arg tarball="$SERVICE_DIST_TAR" ../DockerQueryService/ -t "$QUERYSERVICE_IMAGE_NAME"

docker save "$QUERYSERVICE_IMAGE_NAME" | gzip -9f > "$QUERYSERVICE_IMAGE_NAME".docker.tar.gz