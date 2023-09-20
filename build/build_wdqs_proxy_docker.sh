#!/usr/bin/env bash
set -ex

docker build \
    -t wdqs-proxy \
    Docker/build/WDQS-proxy/

build/docker_tag.sh \
    wdqs-proxy \
    $WIKIBASE_SUITE_RELEASE_MAJOR_VERSION \
    $WIKIBASE_SUITE_RELEASE_MINOR_VERSION \
    $WIKIBASE_SUITE_RELEASE_PATCH_VERSION \
    $WIKIBASE_SUITE_RELEASE_PRERELEASE_VERSION

docker save "$1" | gzip -"$GZIP_COMPRESSION_RATE" > artifacts/"$1".docker.tar.gz
