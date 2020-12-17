#!/bin/bash
set -e

ROOT="$(pwd)"
TARBALL="wikidata-query-gui.tar.gz"
TEMP_DIR="$(mktemp -d)"
TARBALL_PATH="$ROOT"/artifacts/wdqs-ui.tar.gz

git clone 'https://github.com/wikimedia/wikidata-query-gui.git' $TEMP_DIR
cd $TEMP_DIR 

if [ -n "$QUERYSERVICE_UI_COMMIT_HASH" ]; then
    echo "Checking out $QUERYSERVICE_UI_COMMIT_HASH"
else
    echo '$QUERYSERVICE_UI_COMMIT_HASH not set.'
    exit 1;
fi

git reset $QUERYSERVICE_UI_COMMIT_HASH --hard

rm -rfv "$TEMP_DIR/.git"
rm -fv "$TEMP_DIR/.gitignore"

GZIP=-9 tar -C "$TEMP_DIR" -zcvf $TARBALL_PATH .

cd $ROOT

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH="$TARBALL_PATH"" >> $GITHUB_ENV
else
    export TARBALL_PATH
fi