#!/bin/sh

docker build -f Docker/Dockerfile -t "$1" .

docker save "$1" -o "$1".tar
gzip -9 "$1".docker.tar
