#!/bin/bash
set -e

TARBALL="service-$QUERYSERVICE_VERSION-dist.tar.gz"
TARBALL_SIGNATURE="$TARBALL".md5

MD5_SIGNATURE="$(wget -qO- https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$QUERYSERVICE_VERSION/$TARBALL_SIGNATURE)"
MD5_PATH="git_cache/queryservice/$MD5_SIGNATURE"

if [ ! -f "$MD5_PATH/$TARBALL" ]; then
    mkdir -p "$MD5_PATH"
    wget "https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$QUERYSERVICE_VERSION/$TARBALL" \
        -O "$MD5_PATH/$TARBALL"
fi

TARBALL_PATH="$MD5_PATH/$TARBALL"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi