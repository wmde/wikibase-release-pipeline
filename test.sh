#!/bin/bash

docker pull docker-registry.wikimedia.org/releng/quibble-stretch-php73:latest

ROOT=`pwd`
BRANCH="REL1_35"
ENV_FILE="$ROOT/wikibase.env"

mkdir cache -p

chmod a+rw -R git_cache cache

docker run --env-file "$ENV_FILE" \
	--cidfile "$ROOT/container_id" \
	-v "$ROOT"/cache:/cache \
	-v "$ROOT"/git_cache:/srv/git:ro \
	--security-opt label=disable \
	docker-registry.wikimedia.org/releng/quibble-stretch-php73 \
	--packages-source composer \
	--db "$1" \
	--git-cache /srv/git \
	--run phpunit \
	--project-branch mediawiki/core="$BRANCH" \
	--project-branch mediawiki/extensions/UniversalLanguageSelector="$BRANCH" \
	--project-branch mediawiki/extensions/WikibaseCirrusSearch="$BRANCH" \
	--project-branch mediawiki/extensions/cldr="$BRANCH" \
	mediawiki/extensions/UniversalLanguageSelector mediawiki/extensions/WikibaseCirrusSearch mediawiki/extensions/cldr
