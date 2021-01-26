#!/bin/bash
set -e

ROOT="$(pwd)"

EXTENSION=$1
BRANCH_NAME=$2

TEMP_GIT_DIR="$(mktemp -d)"
TEMP_TAR_DIR="$(pwd)"/artifacts
EXT_PATH="$TEMP_GIT_DIR/$EXTENSION"
TARBALL_PATH="$TEMP_TAR_DIR/${EXTENSION,,}.tar.gz"

EXTENSION_COMMIT_HASH_FILE="$ROOT/artifacts/build_metadata_${EXTENSION,,}.env"
EXTENSION_COMMIT_HASH_VARIABLE="${EXTENSION^^}_COMMIT_HASH"

mkdir -p "$TEMP_TAR_DIR"

git clone --depth 1 --single-branch --branch "${BRANCH_NAME}" "$ROOT/git_cache/$EXTENSION.git" "$EXT_PATH"

GIT_TRACE=1 git -C "$EXT_PATH" submodule update --init --recursive

bash "$ROOT"/build/write_git_metadata.sh "$EXT_PATH" "$EXTENSION_COMMIT_HASH_FILE" "$EXTENSION_COMMIT_HASH_VARIABLE"

# remove git things from release package
rm "$EXT_PATH"/.git* -rfv

GZIP=-9 tar -C "$TEMP_GIT_DIR" -zcf "$TARBALL_PATH" "$EXTENSION"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi