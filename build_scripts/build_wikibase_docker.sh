#!/bin/bash
set -e

cp "$TARBALL_PATH" Docker/DockerWikibase
docker build --pull --build-arg MEDIAWIKI_IMAGE_VERSION=$MEDIAWIKI_IMAGE_VERSION Docker/DockerWikibase/ -t "$1"

docker save "$1" | gzip -9f > "$(pwd)"/artifacts/"$1".docker.tar.gz