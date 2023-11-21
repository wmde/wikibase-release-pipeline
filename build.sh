#!/usr/bin/env bash


set -o allexport
source ./variables.env
set +o allexport

env

# TODO: move to flat file hierarchy
# TODO: how do we tag actually?
docker build \
    --build-arg COMPOSER_IMAGE="$COMPOSER_IMAGE" \
    --build-arg GIT_IMAGE="$GIT_IMAGE" \
    --build-arg MEDIAWIKI_IMAGE="$MEDIAWIKI_IMAGE" \
		--build-arg GIT_CURRENT_REVISION="$(git rev-parse HEAD)" \
    \
    --build-arg MEDIAWIKI_SETTINGS_TEMPLATE_FILE="$MEDIAWIKI_SETTINGS_TEMPLATE_FILE" \
    \
    --build-arg MW_SITE_NAME="$MW_SITE_NAME" \
    --build-arg MW_SITE_LANG="$MW_SITE_LANG" \
    --build-arg MW_WG_JOB_RUN_RATE="$MW_WG_JOB_RUN_RATE" \
    --build-arg MW_WG_ENABLE_UPLOADS="$MW_WG_ENABLE_UPLOADS" \
    --build-arg MW_WG_UPLOAD_DIRECTORY="$MW_WG_UPLOAD_DIRECTORY" \
    --build-arg WIKIBASE_PINGBACK="$WIKIBASE_PINGBACK" \
    \
    ./Docker/build/Wikibase -t wikibase:latest
