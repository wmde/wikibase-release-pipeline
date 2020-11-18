#!/bin/bash
set -e

mv "$TARBALL_PATH" Docker
docker build Docker/ -t "$1"

docker save "$1" | gzip -9f > "$1".docker.tar.gz