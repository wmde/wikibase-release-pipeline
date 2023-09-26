#!/usr/bin/env bash
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# debug every invocation
set -x

image_name="$1"

# TODO: https://phabricator.wikimedia.org/T347053
BUILT_EXTENSIONS_PATH=Docker/build/WikibaseBundle/artifacts/extensions

mkdir -p "$BUILT_EXTENSIONS_PATH"

docker load -i "artifacts/wikibase.docker.tar.gz"

# TODO: https://phabricator.wikimedia.org/T347053
## copy oauth template to build artifacts 
cp Docker/build/QuickStatements/oauth.ini Docker/build/WikibaseBundle/artifacts/

# TODO: https://phabricator.wikimedia.org/T347053
## Create LocalSettings dir in build folder
mkdir -p Docker/build/WikibaseBundle/LocalSettings.d/

## If BUNDLE_WMF_EXTENSIONS not defined fallback to default
if [ -z "$BUNDLE_WMF_EXTENSIONS" ]; then
    export BUNDLE_WMF_EXTENSIONS="$DEFAULT_BUNDLE_WMF_EXTENSIONS"
fi

# TODO: handle unset GERRIT_EXTENSION_BRANCH_NAME
set +u

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

# TODO: handle unset GERRIT_EXTENSION_BRANCH_NAME
set -u

## If BUNDLE_EXT_EXTENSIONS not defined fallback to default
if [ -z "$BUNDLE_EXT_EXTENSIONS" ]; then
    export BUNDLE_EXT_EXTENSIONS="$DEFAULT_BUNDLE_EXT_EXTENSIONS"
fi

## External extensions are built from individual scripts
## Example: build/external_extensions/<EXTENSION_NAME>.sh
IFS=',' read -ra EXT_EXTENSIONS <<< "$BUNDLE_EXT_EXTENSIONS"
for EXT_EXTENSION in "${EXT_EXTENSIONS[@]}"; do
    
    ## build external extension
    # shellcheck disable=SC1090 # shellcheck cannot follow variable path
    source "build/external_extension/${EXT_EXTENSION}.sh"
    ## Copy the configuration files to build directory
    cp "Docker/build/WikibaseBundle/LocalSettings.d.template/${EXT_EXTENSION}.php" Docker/build/WikibaseBundle/LocalSettings.d/
done


docker build \
    --no-cache \
    --build-arg WIKIBASE_IMAGE_NAME="$WIKIBASE_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_NAME="$COMPOSER_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_VERSION="$COMPOSER_IMAGE_VERSION" \
    -t "$image_name" \
    Docker/build/WikibaseBundle/ 

