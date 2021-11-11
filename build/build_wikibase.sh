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

COMPOSER_FILE="$TEMP_GIT_DIR/Wikibase/composer.json"
COMPOSER_VENDOR="$TEMP_GIT_DIR/Wikibase/vendor/"

mkdir "$COMPOSER_VENDOR"
chmod 777 "$COMPOSER_VENDOR"

docker run \
    --volume "$COMPOSER_FILE":/tmp/composer.json \
    --volume "$COMPOSER_VENDOR":/tmp/vendor/ \
    "$COMPOSER_IMAGE_NAME:$COMPOSER_IMAGE_VERSION" \
    install --no-dev --ignore-platform-reqs -vv -d "/tmp/"

chmod 755 "$COMPOSER_VENDOR"

GZIP=-9 tar -C "$TEMP_GIT_DIR" -zcf "$TEMP_TAR_DIR"/Wikibase.tar.gz Wikibase

TARBALL_PATH="$TEMP_TAR_DIR/Wikibase.tar.gz"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi