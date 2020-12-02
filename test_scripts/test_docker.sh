#!/bin/bash
set -e

cd test_scripts

# remove local files
rm -f log/*
# does not exists on github
mkdir log -p

docker load -i "../artifacts/$WIKIBASE_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$QUERYSERVICE_IMAGE_NAME.docker.tar.gz"
docker load -i "../artifacts/$QUERYSERVICE_UI_IMAGE_NAME.docker.tar.gz"
docker-compose up -d

docker-compose logs -f --no-color > log/wikibase.log &

# build curl test container 
docker-compose -f docker-compose.yml -f docker-compose-test.yml build wikibase-test
# run curl tests
docker-compose -f docker-compose.yml -f docker-compose-test.yml run wikibase-test bash /run-tests.sh

## build selenium test container
docker-compose -f docker-compose.yml \
    -f docker-compose-selenium-test.yml \
    build wikibase-selenium-test
## run selenium tests
docker-compose -f docker-compose.yml \
    -f docker-compose-selenium-test.yml \
    run wikibase-selenium-test


