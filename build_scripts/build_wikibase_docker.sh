#!/bin/sh

mv "$TARBALL_PATH" Docker
docker build Docker/ -t "$WIKIBASE_IMAGE_NAME"

docker save "$WIKIBASE_IMAGE_NAME" | gzip -9f > "$WIKIBASE_IMAGE_NAME".docker.tar.gz