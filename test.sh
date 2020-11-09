#!/bin/bash
docker pull docker-registry.wikimedia.org/releng/quibble-stretch-php73:latest
                    
git clone --depth 1 --branch REL1_35 https://gerrit.wikimedia.org/r/mediawiki/core
git clone --depth 1 --branch REL1_35 https://gerrit.wikimedia.org/r/mediawiki/skins/Vector

ROOT=`pwd`
WIKIBASE_PATH="$ROOT/Wikibase"
ENV_FILE="$ROOT/wikibase.env"
chmod a+rw -R core
docker run --env-file "$ENV_FILE"  -v "$ROOT/core:/workspace/src" -v "$WIKIBASE_PATH:/workspace/src/extensions/Wikibase" -v "$ROOT/Vector:/workspace/src/skins/Vector/" docker-registry.wikimedia.org/releng/quibble-stretch-php73 mediawiki/extensions/Wikibase --packages-source composer --db sqlite --skip-zuul