#!/bin/bash
set -ex

docker build \
    --build-arg SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES="$SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES" \
    --no-cache Docker/test/selenium/ -t "$TEST_IMAGE_NAME"

docker save "$TEST_IMAGE_NAME" | gzip -"$GZIP_COMPRESSION_RATE"f > artifacts/"$TEST_IMAGE_NAME".docker.tar.gz