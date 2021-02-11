#!/bin/bash
set -e

REPO_PATH=$1
BUILD_METADATA_ENV_FILE=$2
VARIABLE_NAME="METADATA_$3"

# if passed as 4th argument this is the hash
if [ -z "$4" ]; then
    REPO_GIT_HASH="$(git -C "$REPO_PATH" rev-parse HEAD)"
else
    REPO_GIT_HASH=$4
fi

if [ -f "$BUILD_METADATA_ENV_FILE" ]; then
    sed -i "/$VARIABLE_NAME/d" "$BUILD_METADATA_ENV_FILE"
fi

echo "$VARIABLE_NAME=$REPO_GIT_HASH" >> "$BUILD_METADATA_ENV_FILE"
