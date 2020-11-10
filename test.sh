#!/bin/bash
docker pull docker-registry.wikimedia.org/releng/quibble-stretch-php73:latest
                    
#git clone --depth 1 --branch REL1_35 https://gerrit.wikimedia.org/r/mediawiki/core
#git clone --depth 1 --branch REL1_35 https://gerrit.wikimedia.org/r/mediawiki/skins/Vector

ROOT=`pwd`
BRANCH="REL1_35"
#WIKIBASE_PATH="$ROOT/Wikibase"
ENV_FILE="$ROOT/wikibase.env"

#chmod a+rw -R core -f || :
chmod a+rw -R git_cache
chmod a+rw -R cache

#rm "$ROOT/core/LocalSettings.php"

#docker run --env-file "$ENV_FILE"  -v "$ROOT/core:/workspace/src" -v "$WIKIBASE_PATH:/workspace/src/extensions/Wikibase" -v "$ROOT/Vector:/workspace/src/skins/Vector/" docker-registry.wikimedia.org/releng/quibble-stretch-php73 mediawiki/extensions/Wikibase --packages-source composer --db sqlite --skip-zuul --skip selenium,npm-test,phpunit-standalone,api-testing ----project-branch REL1_35

docker run --env-file "$ENV_FILE" \
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
