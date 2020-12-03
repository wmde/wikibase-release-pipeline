#!/bin/bash
set -e

mv "$TARBALL_PATH" Docker
docker build --build-arg MEDIAWIKI_IMAGE_VERSION=$MEDIAWIKI_IMAGE_VERSION Docker/ -t "$1"

docker save "$1" | gzip -9f > "$1".docker.tar.gz