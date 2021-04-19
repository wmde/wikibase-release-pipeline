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

docker load -i "../artifacts/$WIKIBASE_BUNDLE_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$WDQS_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$WDQS_FRONTEND_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$ELASTICSEARCH_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$QUICKSTATEMENTS_IMAGE_NAME.docker.tar.gz"

export LOCALSETTINGS_VARIANT=$1

## build selenium test container
docker-compose \
    -f docker-compose.yml \
    -f docker-compose-selenium-test.yml \
    build \
    --build-arg SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES="$SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES" \
    wikibase-selenium-test


bash run_selenium.sh "$1"