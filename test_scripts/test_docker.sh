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

#docker-compose down
#docker-compose logs -f --no-color > "log/wikibase.curl.log" &

# run curl test container 
#docker-compose -f docker-compose.yml -f docker-compose-test.yml build wikibase-test
#docker-compose -f docker-compose.yml -f docker-compose-test.yml run wikibase-test bash /run-tests.sh

bash run_selenium.sh repo /var/www/html/LocalSettings/LocalSettings.debug.php

bash run_selenium.sh fedprops /var/www/html/LocalSettings/LocalSettings.federatedProperties.php