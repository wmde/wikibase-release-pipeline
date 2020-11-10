#!/bin/sh

mv Wikibase.tar.gz Docker
docker build Docker/ -t "$1"

docker save "$1" -o "$1".docker.tar
gzip -9 "$1".docker.tar
