#!/bin/bash
set -ex

BUILT_EXTENSIONS_PATH=Docker/build/WikibaseBundle/artifacts/extensions

mkdir -p "$BUILT_EXTENSIONS_PATH"

docker load -i "artifacts/wikibase.docker.tar.gz"

if [ -f "$TARBALL_PATH" ]; then
    cp "$TARBALL_PATH" Docker/build/WikibaseBundle/artifacts/
fi

bash build/build_extension.sh OAuth "$WIKIBASE_BRANCH_NAME" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh Scribunto "${WIKIBASE_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh Elastica "${WIKIBASE_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh CirrusSearch "${WIKIBASE_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh WikibaseCirrusSearch "${WIKIBASE_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"

docker build --build-arg WIKIBASE_IMAGE_NAME="$WIKIBASE_IMAGE_NAME" Docker/build/WikibaseBundle/ -t "$WIKIBASE_BUNDLE_IMAGE_NAME"

docker save "$WIKIBASE_BUNDLE_IMAGE_NAME" | gzip -9f > artifacts/"$WIKIBASE_BUNDLE_IMAGE_NAME".docker.tar.gz