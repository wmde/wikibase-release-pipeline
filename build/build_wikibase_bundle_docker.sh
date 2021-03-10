#!/bin/bash
set -ex

BUILT_EXTENSIONS_PATH=Docker/build/WikibaseBundle/artifacts/extensions

mkdir -p "$BUILT_EXTENSIONS_PATH"

docker load -i "artifacts/wikibase.docker.tar.gz"

if [ -z "$GERRIT_EXTENSION_BRANCH_NAME" ]; then
    GERRIT_EXTENSION_BRANCH_NAME="$WIKIBASE_BRANCH_NAME"
fi

bash build/build_extension.sh OAuth "$GERRIT_EXTENSION_BRANCH_NAME" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh Scribunto "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh UniversalLanguageSelector "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh Elastica "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh CirrusSearch "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh WikibaseCirrusSearch "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh WikibaseManifest "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"

docker build --no-cache \
    --build-arg WIKIBASE_IMAGE_NAME="$WIKIBASE_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_NAME="$COMPOSER_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_VERSION="$COMPOSER_IMAGE_VERSION" \
    Docker/build/WikibaseBundle/ -t "$WIKIBASE_BUNDLE_IMAGE_NAME"

docker save "$WIKIBASE_BUNDLE_IMAGE_NAME" | gzip -"$GZIP_COMPRESSION_RATE"f > artifacts/"$WIKIBASE_BUNDLE_IMAGE_NAME".docker.tar.gz