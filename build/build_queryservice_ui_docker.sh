#!/bin/sh
set -e

cp -r "$TARBALL_PATH" Docker/DockerQueryServiceUI
docker build --pull --build-arg tarball="$(basename "$TARBALL_PATH")" Docker/DockerQueryServiceUI/ -t "$1"

docker save "$1" | gzip -9f > "$(pwd)"/artifacts/"$1".docker.tar.gz