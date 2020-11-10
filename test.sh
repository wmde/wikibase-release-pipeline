#!/bin/bash
docker pull docker-registry.wikimedia.org/releng/quibble-stretch-php73:latest
                    
ROOT=`pwd`
BRANCH="REL1_35"
ENV_FILE="$ROOT/wikibase.env"

#remove previous container id file
rm container_id -f

mkdir cache -p

chmod a+rw -R git_cache
chmod a+rw -R cache

docker run --env-file "$ENV_FILE" \
	--cidfile "$ROOT/container_id" \
	-v "$ROOT"/cache:/cache \
	-v "$ROOT"/git_cache:/srv/git:ro \
	--security-opt label=disable \
	docker-registry.wikimedia.org/releng/quibble-stretch-php73 \
	--packages-source composer \
	--db sqlite \
	--git-cache /srv/git \
	--skip all \
	--project-branch mediawiki/core="$BRANCH" \
	--project-branch mediawiki/extensions/UniversalLanguageSelector="$BRANCH" \
	--project-branch mediawiki/extensions/WikibaseCirrusSearch="$BRANCH" \
	--project-branch mediawiki/extensions/cldr="$BRANCH" \
	mediawiki/extensions/UniversalLanguageSelector mediawiki/extensions/WikibaseCirrusSearch mediawiki/extensions/cldr

CONTAINER_ID=`cat container_id`

docker start "$CONTAINER_ID"
docker cp "$CONTAINER_ID":/workspace/src/extensions/Wikibase /tmp/