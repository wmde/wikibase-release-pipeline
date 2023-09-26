#!/usr/bin/env bash
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# debug every invocation
set -x

image_name="$1"

SERVICE_DIST_TAR="$TARBALL_PATH"

# TODO: https://phabricator.wikimedia.org/T347053
cp "$SERVICE_DIST_TAR" Docker/build/WDQS/
cp Docker/build/wait-for-it.sh Docker/build/WDQS/

docker build \
    --pull \
    --build-arg tarball="$(basename "$SERVICE_DIST_TAR")" \
    -t "$image_name" \
    Docker/build/WDQS/ 
