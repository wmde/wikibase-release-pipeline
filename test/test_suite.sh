#!/bin/bash
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

# select image based on prepended suite name
if [[ $SUITE == base__* ]]; then
    WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_IMAGE_NAME"
else
    WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_BUNDLE_IMAGE_NAME"

    # load additional bundle images
    docker load -i "../artifacts/$ELASTICSEARCH_IMAGE_NAME.docker.tar.gz"
    docker load -i "../artifacts/$QUICKSTATEMENTS_IMAGE_NAME.docker.tar.gz"
fi

export WIKIBASE_TEST_IMAGE_NAME

# load default images
docker load -i "../artifacts/$WIKIBASE_TEST_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$WDQS_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$WDQS_FRONTEND_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$WDQS_PROXY_IMAGE_NAME.docker.tar.gz"

export WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_TEST_IMAGE_NAME:latest"
export QUERYSERVICE_IMAGE_NAME="$QUERYSERVICE_IMAGE_NAME:latest"
export QUERYSERVICE_UI_IMAGE_NAME="$QUERYSERVICE_UI_IMAGE_NAME:latest"
export WDQS_PROXY_IMAGE_NAME="$WDQS_PROXY_IMAGE_NAME:latest"
export QUICKSTATEMENTS_IMAGE_NAME="$QUICKSTATEMENTS_IMAGE_NAME:latest"
export ELASTICSEARCH_IMAGE_NAME="$ELASTICSEARCH_IMAGE_NAME:latest"

export DEFAULT_SUITE_CONFIG="--env-file default.env -f docker-compose.yml"

bash run_selenium.sh "$1"