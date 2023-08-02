#!/usr/bin/env bash
set -e

cd test

echo "#########################################"
echo "#########################################"
echo "####         Start testing! 🤞       ####"
echo "#########################################"
echo "#########################################"

docker --version

export SUITE=$1

if [ -z "$SUITE" ]; then
    echo "SUITE is not set"
    exit 1
fi

if [ -z "$DATABASE_IMAGE_NAME" ]; then
    export DATABASE_IMAGE_NAME="$DEFAULT_DATABASE_IMAGE_NAME"
fi

export WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_BUNDLE_IMAGE_NAME"

# load default images
docker load -i "../artifacts/$WIKIBASE_TEST_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$WDQS_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$WDQS_FRONTEND_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$WDQS_PROXY_IMAGE_NAME.docker.tar.gz"
# load additional bundle images
docker load -i "../artifacts/$ELASTICSEARCH_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$QUICKSTATEMENTS_IMAGE_NAME.docker.tar.gz"

export WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_TEST_IMAGE_NAME:latest"
export QUERYSERVICE_IMAGE_NAME="$QUERYSERVICE_IMAGE_NAME:latest"
export QUERYSERVICE_UI_IMAGE_NAME="$QUERYSERVICE_UI_IMAGE_NAME:latest"
export WDQS_PROXY_IMAGE_NAME="$WDQS_PROXY_IMAGE_NAME:latest"
export QUICKSTATEMENTS_IMAGE_NAME="$QUICKSTATEMENTS_IMAGE_NAME:latest"
export ELASTICSEARCH_IMAGE_NAME="$ELASTICSEARCH_IMAGE_NAME:latest"

# Based on the `template.env`` and docker compose files found in the /example directory
# ``/test/default.env`` is added as well and selectively overrides values appropriate to testing, 
# and similar to what a user does in the course of configuring a new Wikibase installation.
export DEFAULT_SUITE_CONFIG="--env-file ../example/template.env --env-file default.env -f docker-compose.root.yml -f ../example/docker-compose.yml -f ../example/docker-compose.extra.yml -f docker-compose.yml -p test "

bash run_selenium.sh "$1"