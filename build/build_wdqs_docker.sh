#!/usr/bin/env bash
set -e

SERVICE_DIST_TAR="$TARBALL_PATH"

cp "$SERVICE_DIST_TAR" Docker/build/WDQS/
cp Docker/build/wait-for-it.sh Docker/build/WDQS/

docker build \
    --pull \
    --build-arg tarball="$(basename "$SERVICE_DIST_TAR")" \
    -t wdqs \
    Docker/build/WDQS/ 

build/docker_tag.sh \
    wdqs \
    $WIKIBASE_SUITE_RELEASE_MAJOR_VERSION \
    $WIKIBASE_SUITE_RELEASE_MINOR_VERSION \
    $WIKIBASE_SUITE_RELEASE_PATCH_VERSION \
    $WIKIBASE_SUITE_RELEASE_PRERELEASE_VERSION

docker save "$1" | gzip -"$GZIP_COMPRESSION_RATE" > artifacts/"$1".docker.tar.gz
