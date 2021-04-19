#!/bin/bash
set -e

cd test

# does not exists on github
mkdir log -p

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
docker load -i "../artifacts/$QUERYSERVICE_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$QUERYSERVICE_UI_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$WDQS_PROXY_IMAGE_NAME.docker.tar.gz"

## build selenium test container
docker-compose \
    -f docker-compose.yml \
    -f docker-compose-selenium-test.yml \
    build \
    --build-arg SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES="$SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES" \
    wikibase-selenium-test

bash run_selenium.sh "$1"