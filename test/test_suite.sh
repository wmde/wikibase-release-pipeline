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

docker load -i "../artifacts/$WIKIBASE_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$QUERYSERVICE_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$QUERYSERVICE_UI_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$ELASTICSEARCH_IMAGE_NAME.docker.tar.gz"

export LOCALSETTINGS_VARIANT=$1

## build selenium test container
docker-compose \
    -f docker-compose.yml \
    -f docker-compose-selenium-test.yml \
    build wikibase-selenium-test

bash run_selenium.sh "$1"