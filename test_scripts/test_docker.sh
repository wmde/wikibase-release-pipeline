#!/bin/bash
set -e

cd test_scripts

# remove local files
rm -f log/*
# does not exists on github
mkdir log -p

docker load -i "../$WIKIBASE_IMAGE_NAME.docker.tar.gz"
docker load -i "../$QUERYSERVICE_IMAGE_NAME.docker.tar.gz"
docker load -i "../$QUERYSERVICE_UI_IMAGE_NAME.docker.tar.gz"

bash run_curl_tests.sh

# repo
bash run_selenium.sh repo /var/www/html/LocalSettings/LocalSettings.debug.php

# federated properties
bash run_selenium.sh fedprops /var/www/html/LocalSettings/LocalSettings.federatedProperties.php