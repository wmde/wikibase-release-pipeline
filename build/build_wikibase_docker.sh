#!/usr/bin/env bash
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# debug every invocation
set -x

image_name="$1"

# TODO: https://phabricator.wikimedia.org/T347053
mkdir -p Docker/build/Wikibase/artifacts
# TODO: https://phabricator.wikimedia.org/T347053
mkdir -p Docker/build/Wikibase/artifacts/extensions

MEDIAWIKI_IMAGE_VERSION="$MEDIAWIKI_VERSION"

if [ -f "$TARBALL_PATH" ]; then
    # TODO: https://phabricator.wikimedia.org/T347053
    cp "$TARBALL_PATH" Docker/build/Wikibase/artifacts/
fi

# TODO: https://phabricator.wikimedia.org/T347053
cp Docker/build/wait-for-it.sh Docker/build/Wikibase/artifacts/
set -o allexport; source Docker/build/Wikibase/default.env; set +o allexport

docker build \
    --build-arg MEDIAWIKI_IMAGE_NAME="$MEDIAWIKI_IMAGE_NAME" \
    --build-arg MEDIAWIKI_IMAGE_VERSION="$MEDIAWIKI_IMAGE_VERSION" \
    --build-arg COMPOSER_IMAGE_NAME="$COMPOSER_IMAGE_NAME" \
    --build-arg COMPOSER_IMAGE_VERSION="$COMPOSER_IMAGE_VERSION" \
    --build-arg MEDIAWIKI_SETTINGS_TEMPLATE_FILE="$MEDIAWIKI_SETTINGS_TEMPLATE_FILE" \
    \
    --build-arg MW_SITE_NAME="$MW_SITE_NAME" \
    --build-arg MW_SITE_LANG="$MW_SITE_LANG" \
    --build-arg MW_WG_JOB_RUN_RATE="$MW_WG_JOB_RUN_RATE" \
    --build-arg MW_WG_ENABLE_UPLOADS="$MW_WG_ENABLE_UPLOADS" \
    --build-arg MW_WG_UPLOAD_DIRECTORY="$MW_WG_UPLOAD_DIRECTORY" \
    --build-arg WIKIBASE_PINGBACK="$WIKIBASE_PINGBACK" \
    \
    -t "$image_name" \
    Docker/build/Wikibase/
