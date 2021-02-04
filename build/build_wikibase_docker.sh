#!/bin/bash
set -ex

mkdir -p Docker/build/Wikibase/artifacts
mkdir -p Docker/build/Wikibase/artifacts/extensions

docker load -i "artifacts/mediawiki.docker.tar.gz"

if [ -f "$TARBALL_PATH" ]; then
    cp "$TARBALL_PATH" Docker/build/Wikibase/artifacts/
fi

cp -r artifacts/oauth.tar.gz Docker/build/Wikibase/artifacts/
cp -r artifacts/elastica.tar.gz Docker/build/Wikibase/artifacts/
cp -r artifacts/cirrussearch.tar.gz Docker/build/Wikibase/artifacts/
cp -r artifacts/wikibasecirrussearch.tar.gz Docker/build/Wikibase/artifacts/
cp Docker/build/wait-for-it.sh Docker/build/Wikibase/artifacts/

docker build --build-arg MEDIAWIKI_IMAGE_NAME="$MEDIAWIKI_IMAGE_NAME" Docker/build/Wikibase/ -t "$1"

docker save "$1" | gzip -9f > artifacts/"$1".docker.tar.gz
