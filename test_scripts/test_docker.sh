#!/bin/bash
set -e

cd test_scripts

# remove local files
rm -f log/*
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

## build selenium test container
docker-compose \
    -f docker-compose.yml \
    -f docker-compose-selenium-test.yml \
    build wikibase-selenium-test

# repo
bash run_selenium.sh repo /var/www/html/LocalSettings/LocalSettings.debug.php

# federated properties
bash run_selenium.sh fedprops /var/www/html/LocalSettings/LocalSettings.federatedProperties.php