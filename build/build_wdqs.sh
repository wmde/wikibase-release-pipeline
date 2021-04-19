#!/bin/bash
# Build script for WDQS
# Downloads the service-dist.tar file from archiva and caches it 
set -e

TARBALL="service-$WDQS_VERSION-dist.tar.gz"
TARBALL_SIGNATURE="$TARBALL".md5

MD5_SIGNATURE="$(wget -qO- "https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$WDQS_VERSION/$TARBALL_SIGNATURE")"
CACHE_PATH="cache/wdqs/$WDQS_VERSION"

if [ ! -f "$CACHE_PATH/$TARBALL" ]; then
    mkdir -p "$CACHE_PATH"
    wget "https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$WDQS_VERSION/$TARBALL" \
        -O "$CACHE_PATH/$TARBALL"
fi

echo "$MD5_SIGNATURE  $CACHE_PATH/$TARBALL" | md5sum -c

TARBALL_PATH="$CACHE_PATH/$TARBALL"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi