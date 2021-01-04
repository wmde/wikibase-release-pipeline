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

# check if the suite has a specific Settings file
LOCALSETTINGS_FILE="LocalSettings/LocalSettings.$1.php"

# fallback to debug output
if [ ! -f $LOCALSETTINGS_FILE ]; then
    LOCALSETTINGS_FILE="LocalSettings/LocalSettings.debug.php"
fi

bash run_selenium.sh $1 $LOCALSETTINGS_FILE