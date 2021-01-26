#!/bin/bash
# Clones a repository and writes the metadata file
set -ex

COMMIT_HASH=$1
GIT_REPO=$2
NAME=$3
TEMP_GIT_DIR=$4
BRANCH=$5

ROOT="$(pwd)"
BUILD_METADATA_ENV_FILE="$ROOT/artifacts/build_metadata_${NAME,,}.env"
BUILD_METADATA_ENV_NAME="${NAME^^}_COMMIT_HASH"

git clone --single-branch --branch "$BRANCH" "$GIT_REPO" "$TEMP_GIT_DIR"

cd "$TEMP_GIT_DIR"

# either use HEAD on master, or tied to a specific commit
if [ -n "$COMMIT_HASH" ]; then
    echo "Checking out $COMMIT_HASH"
    git reset --hard "$COMMIT_HASH"

else
    echo 'COMMIT_HASH not set.'
    # TODO GET IT FROM REPO
    COMMIT_HASH="$(git rev-parse HEAD)"
fi

if [ "$UPDATE_SUBMODULE" = 1 ] ; then
    git submodule update --init --recursive
fi

cd -

bash "$ROOT"/build/write_git_metadata.sh "$TEMP_GIT_DIR" "$BUILD_METADATA_ENV_FILE" "$BUILD_METADATA_ENV_NAME" "$COMMIT_HASH"
