#!/bin/bash
set -e

mv "$TARBALL_PATH" Docker
docker build --build-arg MEDIAWIKI_IMAGE_NAME=$MEDIAWIKI_IMAGE_NAME Docker/ -t "$1"

docker save "$1" | gzip -9f > "$1".docker.tar.gz