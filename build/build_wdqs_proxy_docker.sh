#!/usr/bin/env bash
set -ex

docker build \
    -t wdqs-proxy \
    Docker/build/WDQS-proxy/

build/docker_tag.sh wdqs-proxy

docker save "$1" | gzip -"$GZIP_COMPRESSION_RATE" > artifacts/"$1".docker.tar.gz
