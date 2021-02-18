#!/bin/bash
set -ex

docker build --no-cache --pull Docker/build/Composer/ -t "$1"
docker save "$1" | gzip -"$GZIP_COMPRESSION_RATE"f > artifacts/"$1".docker.tar.gz
