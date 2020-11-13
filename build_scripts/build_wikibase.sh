#!/bin/bash
docker pull docker-registry.wikimedia.org/releng/quibble-stretch-php73:latest

ROOT="$(pwd)"
BRANCH="REL1_35"
ENV_FILE="$ROOT/wikibase.env"
TEMP_DIR="$(mktemp -d)"

# Remove previous container id file
rm container_id -f

mkdir cache -p

chmod a+rw -R --silent git_cache cache

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
	--skip-install

# copy cloned repo and remove container
CONTAINER_ID=`cat container_id`
docker cp "$CONTAINER_ID":/workspace/src/extensions/Wikibase /tmp/
docker rm -f "$CONTAINER_ID"

# remove git things from release package
rm /tmp/Wikibase/.git* -rfv

GZIP=-9 tar -C /tmp -zcvf "$TEMP_DIR"/Wikibase.tar.gz Wikibase

echo "TARBALL_PATH="$TEMP_DIR/Wikibase.tar.gz"" >> $GITHUB_ENV