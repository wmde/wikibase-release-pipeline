#!/bin/bash
# Clones a repository and writes the metadata file
set -e

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
    git reset --hard "$COMMIT_HASH"

else
    echo "COMMIT_HASH not set using HEAD of $BRANCH."
    COMMIT_HASH="$(git rev-parse HEAD)"
fi

# log the selected commit
echo
echo "Checking out $NAME at"
git show "$COMMIT_HASH" --quiet
echo

if [ "$UPDATE_SUBMODULE" = 1 ] ; then
    git submodule update --init --recursive
fi

cd -

bash "$ROOT"/build/write_git_metadata.sh "$TEMP_GIT_DIR" "$BUILD_METADATA_ENV_FILE" "$BUILD_METADATA_ENV_NAME" "$COMMIT_HASH"
