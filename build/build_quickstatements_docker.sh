#!/usr/bin/env bash
set -ex

mkdir -p Docker/build/QuickStatements/artifacts
cp "$TARBALL_PATH" Docker/build/QuickStatements/artifacts/

docker build \
    --build-arg COMPOSER_IMAGE_NAME="$COMPOSER_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_VERSION="$COMPOSER_IMAGE_VERSION" \
    --no-cache \
    -t "quickstatements" \
    Docker/build/QuickStatements/

build/docker_tag.sh \
    quickstatements \
    "$WIKIBASE_SUITE_RELEASE_MAJOR_VERSION" \
    "$WIKIBASE_SUITE_RELEASE_MINOR_VERSION" \
    "$WIKIBASE_SUITE_RELEASE_PATCH_VERSION" \
    "$WIKIBASE_SUITE_RELEASE_PRERELEASE_VERSION"


docker save "$1" | gzip -"$GZIP_COMPRESSION_RATE" > artifacts/"$1".docker.tar.gz
