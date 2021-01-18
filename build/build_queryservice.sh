#!/bin/bash
set -e

TARBALL="service-$QUERYSERVICE_VERSION-dist.tar.gz"
TEMP_DIR="$(mktemp -d)"

wget "https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$QUERYSERVICE_VERSION/$TARBALL" \
    -O "$TEMP_DIR/$TARBALL"

TARBALL_PATH="$TEMP_DIR/$TARBALL"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=""$TARBALL_PATH""" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi