#!/bin/bash
set -ex

mkdir -p Docker/build/Wikibase/artifacts
mkdir -p Docker/build/Wikibase/artifacts/extensions

MEDIAWIKI_IMAGE_VERSION="$MEDIAWIKI_VERSION"

if [ -f "$TARBALL_PATH" ]; then
    cp "$TARBALL_PATH" Docker/build/Wikibase/artifacts/
fi

cp Docker/build/wait-for-it.sh Docker/build/Wikibase/artifacts/

docker build \
    --build-arg MEDIAWIKI_IMAGE_NAME="$MEDIAWIKI_IMAGE_NAME" \
    --build-arg MEDIAWIKI_IMAGE_VERSION="$MEDIAWIKI_IMAGE_VERSION" \
    --build-arg COMPOSER_IMAGE_NAME="$COMPOSER_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_VERSION="$COMPOSER_IMAGE_VERSION" \
    Docker/build/Wikibase/ -t "$1"

docker save "$1" | gzip -"$GZIP_COMPRESSION_RATE"f > artifacts/"$1".docker.tar.gz
