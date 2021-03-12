#!/bin/bash
set -e

TEMP_GIT_DIR=$(mktemp -d)

cp artifacts/build_metadata_* "$TEMP_GIT_DIR"

mkdir -p "artifacts/LastBuildMetadata/$WMDE_RELEASE_VERSION/"

if diff "$TEMP_GIT_DIR" "artifacts/LastBuildMetadata/$WMDE_RELEASE_VERSION/" -rq; then
    exit 0
else
    rm -f artifacts/LastBuildMetadata/"$WMDE_RELEASE_VERSION"/*
    cp "$TEMP_GIT_DIR"/* "artifacts/LastBuildMetadata/$WMDE_RELEASE_VERSION/"
    python publish/queue_publish.py
fi
