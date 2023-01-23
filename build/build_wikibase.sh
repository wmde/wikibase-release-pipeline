#!/bin/bash
set -ex

ROOT="$(pwd)"

TEMP_GIT_DIR="$(mktemp -d)"
TEMP_TAR_DIR="$(pwd)"/artifacts
WIKIBASE_PATH="$TEMP_GIT_DIR/Wikibase"

UPDATE_SUBMODULE=1 bash "$ROOT"/build/clone_repo.sh \
    "$WIKIBASE_COMMIT_HASH" \
    "$ROOT/git_cache/Wikibase.git" \
    WIKIBASE \
    "$WIKIBASE_PATH" \
    "${WIKIBASE_BRANCH_NAME}"

bash "$ROOT"/build/clean_repo.sh "$WIKIBASE_PATH"

# remove travis build file
rm "$WIKIBASE_PATH"/.travis.yml -vf

WIKIBASE_DIR="$TEMP_GIT_DIR/Wikibase/"
COMPOSER_FILE="$WIKIBASE_DIR/composer.json"
COMPOSER_VENDOR="$WIKIBASE_DIR/vendor/"

mkdir $COMPOSER_VENDOR
chmod 777 "$COMPOSER_VENDOR"
# TODO rmeove the below hack...
# composer config --no-plugins allow-plugins.composer/installers true
docker run \
    --volume "$WIKIBASE_DIR":/tmp/Wikibase \
    -u $(id -u ${USER}):$(id -g ${USER}) \
    "$COMPOSER_IMAGE_NAME:$COMPOSER_IMAGE_VERSION" \
    config --no-plugins allow-plugins.composer/installers true
docker run \
    --volume "$WIKIBASE_DIR":/tmp/Wikibase \
    -u $(id -u ${USER}):$(id -g ${USER}) \
    "$COMPOSER_IMAGE_NAME:$COMPOSER_IMAGE_VERSION" \
    install --no-dev --ignore-platform-reqs -vv -d "/tmp/Wikibase"
chmod 755 "$COMPOSER_VENDOR"

GZIP=-9 tar -C "$TEMP_GIT_DIR" -zcf "$TEMP_TAR_DIR"/Wikibase.tar.gz Wikibase

TARBALL_PATH="$TEMP_TAR_DIR/Wikibase.tar.gz"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi