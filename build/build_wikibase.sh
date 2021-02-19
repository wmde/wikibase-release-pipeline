#!/bin/bash
set -ex

ROOT="$(pwd)"

TEMP_GIT_DIR="$(mktemp -d)"
TEMP_TAR_DIR="$(pwd)"/artifacts
WIKIBASE_PATH="$TEMP_GIT_DIR/Wikibase"

git clone --depth 1 --single-branch --branch "${WIKIBASE_BRANCH_NAME}" "$ROOT/git_cache/Wikibase.git" "$WIKIBASE_PATH"

GIT_TRACE=1 git -C "$WIKIBASE_PATH" submodule update --init --recursive

bash "$ROOT"/build/write_git_metadata.sh "$WIKIBASE_PATH" "$ROOT"/artifacts/build_metadata_wikibase.env "WIKIBASE_COMMIT_HASH"

# remove git things from release package
rm "$WIKIBASE_PATH"/.git* -rfv

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