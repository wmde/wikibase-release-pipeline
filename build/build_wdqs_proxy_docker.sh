#!/usr/bin/env bash
set -ex

docker build \
    Docker/build/WDQS-proxy/ -t "$1"

docker save "$1" | gzip -"$GZIP_COMPRESSION_RATE" > artifacts/"$1".docker.tar.gz
