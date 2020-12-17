#!/bin/bash
set -e

docker load -i "artifacts/$MEDIAWIKI_IMAGE_NAME.docker.tar.gz"

if [ -f "$TARBALL_PATH" ]; then
    cp "$TARBALL_PATH" Docker/DockerWikibase
fi

docker build --build-arg MEDIAWIKI_IMAGE_NAME=$MEDIAWIKI_IMAGE_NAME Docker/DockerWikibase/ -t "$1"

docker save "$1" | gzip -9f > artifacts/"$1".docker.tar.gz