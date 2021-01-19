#!/bin/bash
set -ex

ROOT="$(pwd)"
TEMP_GIT_DIR="$(mktemp -d)"
TARBALL_PATH="$ROOT"/artifacts/wdqs-frontend.tar.gz
BUILD_METADATA_ENV_FILE=$ROOT/artifacts/build_metadata_wdqs_ui.env

git clone --single-branch --branch master "$ROOT/git_cache/services/wikidata-query-gui.git" "$TEMP_GIT_DIR"

cd "$TEMP_GIT_DIR"

# either use HEAD on master, or tied to a specific commit
if [ -n "$QUERYSERVICE_UI_COMMIT_HASH" ]; then
    echo "Checking out $QUERYSERVICE_UI_COMMIT_HASH"
    git reset --hard "$QUERYSERVICE_UI_COMMIT_HASH"
    bash "$ROOT"/build/write_git_metadata.sh "$TEMP_GIT_DIR" "$BUILD_METADATA_ENV_FILE" "QUERYSERVICE_UI_COMMIT_HASH" "$QUERYSERVICE_UI_COMMIT_HASH"
else
    echo 'QUERYSERVICE_UI_COMMIT_HASH not set.'
    bash "$ROOT"/build/write_git_metadata.sh "$TEMP_GIT_DIR" "$BUILD_METADATA_ENV_FILE" "QUERYSERVICE_UI_COMMIT_HASH"
fi

rm -rfv "$TEMP_GIT_DIR/.git"
rm -fv "$TEMP_GIT_DIR/.gitignore"

GZIP=-9 tar -C "$TEMP_GIT_DIR" -zcvf "$TARBALL_PATH" .

cd "$ROOT"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi