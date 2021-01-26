#!/bin/bash
set -ex

COMMIT_HASH=$1
TEMP_GIT_DIR=$2
BUILD_METADATA_ENV_FILE=$3
BUILD_METADATA_ENV_NAME=$4

git clone --single-branch --branch master "$ROOT/git_cache/services/wikidata-query-gui.git" "$TEMP_GIT_DIR"

cd "$TEMP_GIT_DIR"

# either use HEAD on master, or tied to a specific commit
if [ -n "$COMMIT_HASH" ]; then
    echo "Checking out $COMMIT_HASH"
    git reset --hard "$COMMIT_HASH"
    bash "$ROOT"/build/write_git_metadata.sh "$TEMP_GIT_DIR" "$BUILD_METADATA_ENV_FILE" "$BUILD_METADATA_ENV_NAME" "$COMMIT_HASH"
else
    echo 'COMMIT_HASH not set.'
    # TODO GET IT FROM REPO
    bash "$ROOT"/build/write_git_metadata.sh "$TEMP_GIT_DIR" "$BUILD_METADATA_ENV_FILE" "$BUILD_METADATA_ENV_NAME"
fi
