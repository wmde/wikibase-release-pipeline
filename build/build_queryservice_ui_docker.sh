#!/bin/sh
set -e

cp -r "$TARBALL_PATH" Docker/build/QueryServiceUI
docker build --pull --build-arg tarball="$(basename "$TARBALL_PATH")" Docker/build/QueryServiceUI/ -t "$1"

docker save "$1" | gzip -9f > "$(pwd)"/artifacts/"$1".docker.tar.gz