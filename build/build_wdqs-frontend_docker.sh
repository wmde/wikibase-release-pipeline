#!/usr/bin/env bash
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# debug every invocation
set -x

image_name="$1"

# TODO: https://phabricator.wikimedia.org/T347053
cp -r "$TARBALL_PATH" Docker/build/WDQS-frontend

docker build \
    --pull \
    --build-arg tarball="$(basename "$TARBALL_PATH")" \
    -t "$image_name" \
    Docker/build/WDQS-frontend/
