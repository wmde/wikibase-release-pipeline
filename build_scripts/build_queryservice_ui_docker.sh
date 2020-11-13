#!/bin/sh

cp -r "$TARBALL_PATH" DockerQueryServiceUI
docker build --build-arg tarball="$(basename "$TARBALL_PATH")" DockerQueryServiceUI/ -t "$1"

docker save "$1" | gzip -9f > "$1".docker.tar.gz