#!/usr/bin/env bash

set -e

TARGET=$1
RELEASE_ENV_FILE=$2

if ! [[ -d .git ]]; then
    echo "ERROR: builder.sh must be executed from the root of the repository!" >&2
    exit 1
fi

usage() {
    echo "USAGE: $0 <TARGET> <RELEASE_ENV_FILE>" >&2
}

if [[ -z "$TARGET" ]]; then
    echo "ERROR: TARGET is not set!" >&2
    usage
    exit 1
fi

if [[ ! -f "$RELEASE_ENV_FILE" ]]; then
    echo "ERROR: RELEASE_ENV_FILE is not set!" >&2
    usage
    exit 1
fi

if [[ ! -f "local.env" ]]; then
    touch local.env
fi

HOST_TMP="$(mktemp -d)"
remove_builder_tmp() {
    echo "🧹 Cleanup temp files from ${HOST_TMP}"
    rm -rf "${HOST_TMP}"
}
trap remove_builder_tmp EXIT

docker build --quiet . -t builder:latest
docker run \
    --rm \
    \
    --user "$(id -u):$(id -g)" \
    --group-add "$(getent group docker | cut -d: -f3)" \
    \
    -v "$(pwd)/Makefile":/app/Makefile \
    -v "$(pwd)/local.env":/app/local.env \
    -v "$(pwd)/variables.env":/app/variables.env \
    -v "$(pwd)/$RELEASE_ENV_FILE":/app/builder_configuration.env \
    \
    -v "$(pwd)/build":/app/build \
    -v "$(pwd)/Docker/build":/app/Docker/build \
    \
    -v "$(pwd)/update_cache.sh":/app/update_cache.sh \
    -v "$(pwd)/cache":/app/cache \
    -v "$(pwd)/git_cache":/app/git_cache \
    \
    -v "$(pwd)/artifacts":/app/artifacts \
    \
    -v /var/run/docker.sock:/var/run/docker.sock \
    \
    -v "${HOST_TMP}":/tmp \
    -e HOST_TMP="${HOST_TMP}" \
    \
    -e BUILD_TIMESTAMP="$(date +%Y%m%d%H%M%S)" \
    -e GIT_REVISION_HASH="$(git rev-parse --short HEAD)" \
    -e GIT_REVISION_BRANCH="$(git rev-parse --abbrev-ref HEAD)" \
    \
    builder:latest make "$TARGET" -j"$(nproc)"


