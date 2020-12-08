#!/bin/bash
set -e

export DOCKER_INCLUDE_SETTINGS=$2

#docker-compose down
docker-compose up -d --force-recreate
docker-compose logs -f --no-color > "log/wikibase.$1.log" &

## build selenium test container
docker-compose -f docker-compose.yml \
    -f docker-compose-selenium-test.yml \
    build wikibase-selenium-test

docker-compose \
    -f docker-compose.yml \
    -f docker-compose-selenium-test.yml \
    run \
    wikibase-selenium-test npm run "test:$1"