#!/bin/bash

DOCKER_IMAGE_NAME="docker-registry.wikimedia.org/releng/quibble-stretch-php$2:latest"
docker pull "$DOCKER_IMAGE_NAME"

ROOT=`pwd`
BRANCH="REL1_35"
ENV_FILE="$ROOT/wikibase.env"

mkdir cache -p

chmod a+rw -R --silent git_cache cache

docker run --env-file "$ENV_FILE" \
	--cidfile "$ROOT/container_id" \
	-v "$ROOT"/cache:/cache \
	-v "$ROOT"/git_cache:/srv/git:ro \
	--security-opt label=disable \
	"$DOCKER_IMAGE_NAME" \
	--packages-source composer \
	--db "$1" \
	--skip selenium \
	--git-cache /srv/git \
	--project-branch mediawiki/core="$BRANCH" \
	--project-branch mediawiki/extensions/UniversalLanguageSelector="$BRANCH" \
	--project-branch mediawiki/extensions/WikibaseCirrusSearch="$BRANCH" \
	--project-branch mediawiki/extensions/cldr="$BRANCH" \
	mediawiki/extensions/UniversalLanguageSelector mediawiki/extensions/WikibaseCirrusSearch mediawiki/extensions/cldr

CONTAINER_ID=`cat container_id`

docker rm -f "$CONTAINER_ID"
