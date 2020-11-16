#!/bin/bash
set -e

TARBALL="service-$QUERYSERVICE_VERSION-dist.tar.gz"
TEMP_DIR="$(mktemp -d)"

wget "https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$QUERYSERVICE_VERSION/$TARBALL" \
    -O "$TEMP_DIR/$TARBALL"

echo "TARBALL_PATH="$TEMP_DIR/$TARBALL"" >> $GITHUB_ENV