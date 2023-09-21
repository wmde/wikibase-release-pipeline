#!/usr/bin/env bash
# shellcheck disable=SC1091
set -e

image_name="$1"

BUILD_TMP="/tmp/build-wikibase-docker"

mkdir -p "${BUILD_TMP}"
cp -r Docker/build/Wikibase/* "${BUILD_TMP}"

mkdir -p "${BUILD_TMP}/artifacts/extensions"

MEDIAWIKI_IMAGE_VERSION="$MEDIAWIKI_VERSION"

if [ -f "$TARBALL_PATH" ]; then
    cp "$TARBALL_PATH" "${BUILD_TMP}/artifacts/"
fi

cp Docker/build/wait-for-it.sh "${BUILD_TMP}/artifacts/"
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
    \
    ${BUILD_TMP}

build/docker_tag.sh "$image_name"

docker save \
    "$image_name" \
    "${DOCKER_REPOSITORY_NAME}/${image_name}" \
    "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}" \
    | gzip -"$GZIP_COMPRESSION_RATE" \
    > "$(pwd)/artifacts/${image_name}.docker.tar.gz"
