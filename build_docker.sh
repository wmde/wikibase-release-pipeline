#!/bin/sh

mv Wikibase.tar.gz Docker
docker build Docker/ -t "$1"

docker save "$1" | gzip -9f > "$1".docker.tar.gz