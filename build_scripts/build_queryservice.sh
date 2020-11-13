#!/bin/bash

TARBALL="service-$QUERYSERVICE_VERSION-dist.tar.gz"
TEMP_DIR="$(mktemp -d)"

wget "https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$QUERYSERVICE_VERSION/$TARBALL" \
    -O "$TEMP_DIR/$TARBALL"

export TARBALL_PATH="$TEMP_DIR/$TARBALL"
echo "::set-env name=TARBALL_PATH::$TARBALL_PATH"