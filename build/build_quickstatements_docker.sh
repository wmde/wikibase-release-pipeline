#!/bin/bash
set -e

echo "hello"
#SERVICE_DIST_TAR="$TARBALL_PATH"

#cp "$SERVICE_DIST_TAR" Docker/build/QueryService/
#cp Docker/build/wait-for-it.sh Docker/build/QueryService/

#docker build --pull --build-arg tarball="$(basename "$SERVICE_DIST_TAR")" Docker/build/QueryService/ -t "$1"

#docker save "$1" | gzip -9f > artifacts/"$1".docker.tar.gz
