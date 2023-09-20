#!/usr/bin/env bash
# shellcheck disable=SC1090
set -e

BUILT_EXTENSIONS_PATH=Docker/build/WikibaseBundle/artifacts/extensions

mkdir -p "$BUILT_EXTENSIONS_PATH"

docker load -i "artifacts/wikibase.docker.tar.gz"

## copy oauth template to build artifacts 
cp Docker/build/QuickStatements/oauth.ini Docker/build/WikibaseBundle/artifacts/

## Create LocalSettings dir in build folder
mkdir -p Docker/build/WikibaseBundle/LocalSettings.d/

## If BUNDLE_WMF_EXTENSIONS not defined fallback to default
if [ -z "$BUNDLE_WMF_EXTENSIONS" ]; then
    export BUNDLE_WMF_EXTENSIONS="$DEFAULT_BUNDLE_WMF_EXTENSIONS"
fi

## If the $GERRIT_EXTENSION_BRANCH_NAME override is set, use that branch
if [ -z "$GERRIT_EXTENSION_BRANCH_NAME" ]; then
    GERRIT_EXTENSION_BRANCH_NAME="$WIKIBASE_BRANCH_NAME"
fi

## Extensions from gerrit
IFS=',' read -ra EXTENSIONS <<< "$BUNDLE_WMF_EXTENSIONS"
for EXTENSION in "${EXTENSIONS[@]}"; do
    bash build/build_extension.sh "$EXTENSION" "${GERRIT_EXTENSION_BRANCH_NAME}" "$BUILT_EXTENSIONS_PATH"
    ## Copy the configuration files to build directory
    cp "Docker/build/WikibaseBundle/LocalSettings.d.template/${EXTENSION}.php" Docker/build/WikibaseBundle/LocalSettings.d/
done

## If BUNDLE_EXT_EXTENSIONS not defined fallback to default
if [ -z "$BUNDLE_EXT_EXTENSIONS" ]; then
    export BUNDLE_EXT_EXTENSIONS="$DEFAULT_BUNDLE_EXT_EXTENSIONS"
fi

## External extensions are built from individual scripts
## Example: build/external_extensions/<EXTENSION_NAME>.sh
IFS=',' read -ra EXT_EXTENSIONS <<< "$BUNDLE_EXT_EXTENSIONS"
for EXT_EXTENSION in "${EXT_EXTENSIONS[@]}"; do
    
    ## build external extension
    . "build/external_extension/${EXT_EXTENSION}.sh"
    ## Copy the configuration files to build directory
    cp "Docker/build/WikibaseBundle/LocalSettings.d.template/${EXT_EXTENSION}.php" Docker/build/WikibaseBundle/LocalSettings.d/
done

image_name="wikibase-bundle"

docker build \
    --no-cache \
    --build-arg WIKIBASE_IMAGE_NAME="$WIKIBASE_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_NAME="$COMPOSER_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_VERSION="$COMPOSER_IMAGE_VERSION" \
    -t "$image_name" \
    Docker/build/WikibaseBundle/

build/docker_tag.sh "$image_name"

docker save \
    "$image_name" \
    "${DOCKER_REPOSITORY_NAME}/${image_name}" \
    "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}" \
    | gzip -"$GZIP_COMPRESSION_RATE" \
    > "$(pwd)/artifacts/${image_name}.docker.tar.gz"
