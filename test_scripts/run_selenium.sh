#!/bin/bash
set -e

# start container with settings
docker-compose up -d --force-recreate
docker-compose logs -f --no-color > "log/wikibase.$1.log" &

# run status checks and wait until containers start
docker-compose -f docker-compose.yml -f docker-compose-curl-test.yml build wikibase-test
docker-compose -f docker-compose.yml -f docker-compose-curl-test.yml run wikibase-test

docker-compose \
    -f docker-compose.yml \
    -f docker-compose-selenium-test.yml \
    run wikibase-selenium-test npm run "test:$1"

docker-compose down