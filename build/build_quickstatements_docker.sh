#!/bin/bash
set -ex

mkdir -p Docker/build/QuickStatements/artifacts
cp "$TARBALL_PATH" Docker/build/QuickStatements/artifacts/

docker build \
    --build-arg COMPOSER_IMAGE_NAME="$COMPOSER_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_VERSION="$COMPOSER_IMAGE_VERSION" \
    --no-cache Docker/build/QuickStatements/ -t "$1"

docker save "$1" | gzip -"$GZIP_COMPRESSION_RATE"f > artifacts/"$1".docker.tar.gz
