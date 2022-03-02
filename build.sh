#!/bin/bash
TARGET=$1
RELEASE_ENV_FILE=$2

if [ ! -f "$RELEASE_ENV_FILE" ]; then
    echo "RELEASE_ENV_FILE is not set!"
    exit 1
fi

if [ ! -f "local.env" ]; then
    touch local.env
fi

echo
cat "$RELEASE_ENV_FILE"
echo

docker build . -t builder && \
 docker run -i \
 -v "$(pwd)/variables.env":/app/variables.env \
 -v "$(pwd)/$RELEASE_ENV_FILE":/app/builder_configuration.env \
 -v "$(pwd)/artifacts":/app/artifacts \
 -v "$(pwd)/git_cache":/app/git_cache \
 -v "$(pwd)/cache":/app/cache \
 -v "/tmp":/tmp \
 -v /var/run/docker.sock:/var/run/docker.sock \
 builder:latest make "$TARGET"