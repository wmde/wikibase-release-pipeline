#!/bin/bash
set -ex

BUILT_EXTENSIONS_PATH=Docker/build/WikibaseBundle/artifacts/extensions

mkdir -p "$BUILT_EXTENSIONS_PATH"

docker load -i "artifacts/wikibase.docker.tar.gz"

if [ -z "$GERRIT_EXTENSION_BRANCH_NAME" ]; then
    GERRIT_EXTENSION_BRANCH_NAME="$WIKIBASE_BRANCH_NAME"
fi

## Extensions from gerrit
bash build/build_extension.sh Babel "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh OAuth "$GERRIT_EXTENSION_BRANCH_NAME" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh Scribunto "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh UniversalLanguageSelector "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh EntitySchema "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh Elastica "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh CirrusSearch "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh VisualEditor "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh WikibaseCirrusSearch "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh Nuke "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh WikibaseManifest "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh cldr "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
bash build/build_extension.sh ConfirmEdit "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"

## Extensions without branch compatibility
## WikibaseLocalMedia
UPDATE_SUBMODULE=0 bash build/clone_repo.sh \
    "$WIKIBASELOCALMEDIA_COMMIT_HASH" \
    "git_cache/WikibaseLocalMedia.git" \
    WIKIBASELOCALMEDIA \
    "$BUILT_EXTENSIONS_PATH/WikibaseLocalMedia" \
    master && bash build/clean_repo.sh "$BUILT_EXTENSIONS_PATH/WikibaseLocalMedia"


docker build --no-cache \
    --build-arg WIKIBASE_IMAGE_NAME="$WIKIBASE_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_NAME="$COMPOSER_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_VERSION="$COMPOSER_IMAGE_VERSION" \
    Docker/build/WikibaseBundle/ -t "$WIKIBASE_BUNDLE_IMAGE_NAME"

docker save "$WIKIBASE_BUNDLE_IMAGE_NAME" | gzip -"$GZIP_COMPRESSION_RATE"f > artifacts/"$WIKIBASE_BUNDLE_IMAGE_NAME".docker.tar.gz