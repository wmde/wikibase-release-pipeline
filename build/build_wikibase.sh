#!/usr/bin/env bash
set -ex

ROOT="$(pwd)"

ARTIFACT_PATH="$(pwd)/artifacts"
WIKIBASE_PATH="/tmp/Wikibase"
WIKIBASE_PATH_HOST="${HOST_TMP}/Wikibase"

UPDATE_SUBMODULE=1 bash "$ROOT"/build/clone_repo.sh \
    "$WIKIBASE_COMMIT_HASH" \
    "$ROOT/git_cache/Wikibase.git" \
    WIKIBASE \
    "$WIKIBASE_PATH" \
    "${WIKIBASE_BRANCH_NAME}"

bash "$ROOT"/build/clean_repo.sh "$WIKIBASE_PATH"

# remove travis build file
rm "$WIKIBASE_PATH"/.travis.yml -vf

COMPOSER_VENDOR="$WIKIBASE_PATH/vendor/"

mkdir "$COMPOSER_VENDOR"
chmod 777 "$COMPOSER_VENDOR"

# TODO remove the below hack:
# composer config --no-plugins allow-plugins.composer/installers false
# Note: we need to provide the host path for setting up the volume, as we
# are currently already in the context of a container, we cannot just use
# the current path from the current context
docker run --rm \
    --volume "$WIKIBASE_PATH_HOST":/tmp/Wikibase \
    -u "$(id -u)":"$(id -g)" \
    "$COMPOSER_IMAGE_NAME:$COMPOSER_IMAGE_VERSION" \
    config --no-plugins allow-plugins.composer/installers false -d "/tmp/Wikibase"
docker run --rm \
    --volume "$WIKIBASE_PATH_HOST":/tmp/Wikibase \
    -u "$(id -u)":"$(id -g)" \
    "$COMPOSER_IMAGE_NAME:$COMPOSER_IMAGE_VERSION" \
    install --no-dev --ignore-platform-reqs -vv -d "/tmp/Wikibase"
chmod 755 "$COMPOSER_VENDOR"

tar -C "$(dirname "$WIKIBASE_PATH")" -cf - Wikibase | gzip -"$GZIP_COMPRESSION_RATE" > "$ARTIFACT_PATH"/Wikibase.tar.gz

TARBALL_PATH="$ARTIFACT_PATH/Wikibase.tar.gz"

if [ -n "$GITHUB_ENV" ]; then
    echo "TARBALL_PATH=$TARBALL_PATH" >> "$GITHUB_ENV"
else
    export TARBALL_PATH
fi
