#!/bin/bash
set -e

ROOT="$(pwd)"

EXTENSION=$1
BRANCH_NAME=$2
FINAL_EXTENSION_PATH=$3

TEMP_GIT_DIR="$(mktemp -d)"
TEMP_TAR_DIR="$(pwd)"/artifacts
EXT_PATH="$TEMP_GIT_DIR/$EXTENSION"
EXTENSION_COMMIT_HASH_VARIABLE="${EXTENSION^^}_COMMIT_HASH"

mkdir -p "$TEMP_TAR_DIR"

COMMIT_HASH=${!EXTENSION_COMMIT_HASH_VARIABLE}
UPDATE_SUBMODULE=1 bash "$ROOT"/build/clone_repo.sh \
    "$COMMIT_HASH" \
    "$ROOT/git_cache/$EXTENSION.git" \
    "$EXTENSION" \
    "$EXT_PATH" \
    "${BRANCH_NAME}"

bash "$ROOT"/build/clean_repo.sh "$EXT_PATH"

cp -r "$EXT_PATH" "$FINAL_EXTENSION_PATH"