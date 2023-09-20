#!/bin/sh
set -e

cp -r "$TARBALL_PATH" Docker/build/WDQS-frontend

docker build \
    --pull \
    --build-arg tarball="$(basename "$TARBALL_PATH")" \
    -t wdqs-frontend \
    Docker/build/WDQS-frontend/

d/docker_tag.sh \
    wdqs-frontend \
    "$WIKIBASE_SUITE_RELEASE_MAJOR_VERSION" \
    "$WIKIBASE_SUITE_RELEASE_MINOR_VERSION" \
    "$WIKIBASE_SUITE_RELEASE_PATCH_VERSION" \
    "$WIKIBASE_SUITE_RELEASE_PRERELEASE_VERSION"

docker save "$1" | gzip -"$GZIP_COMPRESSION_RATE"f > "$(pwd)"/artifacts/"$1".docker.tar.gz
