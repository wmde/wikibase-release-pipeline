#!/usr/bin/env bash
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
COMPOSER_VENDOR="$WIKIBASE_DIR/vendor/"

mkdir "$COMPOSER_VENDOR"
chmod 777 "$COMPOSER_VENDOR"

# TODO remove the below hack:
# composer config --no-plugins allow-plugins.composer/installers false
docker run --rm \
    --volume "$WIKIBASE_DIR":/tmp/Wikibase \
    -u "$(id -u "${USER}")":"$(id -g "${USER}")" \
    "$COMPOSER_IMAGE_NAME:$COMPOSER_IMAGE_VERSION" \
    config --no-plugins allow-plugins.composer/installers false -d "/tmp/Wikibase"
docker run --rm \
    --volume "$WIKIBASE_DIR":/tmp/Wikibase \
    -u "$(id -u "${USER}")":"$(id -g "${USER}")" \
    "$COMPOSER_IMAGE_NAME:$COMPOSER_IMAGE_VERSION" \
    install --no-dev --ignore-platform-reqs -vv -d "/tmp/Wikibase"
chmod 755 "$COMPOSER_VENDOR"

tar -C "$TEMP_GIT_DIR" -cf - Wikibase | gzip -"$GZIP_COMPRESSION_RATE" > "$TEMP_TAR_DIR"/wikibase.tar.gz

TARBALL_PATH="$TEMP_TAR_DIR/wikibase.tar.gz"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi
