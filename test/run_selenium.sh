#!/bin/bash
# shellcheck disable=SC2086
set -ex


SUITE_CONFIG="-f docker-compose.yml -f docker-compose.override.yml"

# start container with settings
docker-compose $SUITE_CONFIG up -d --force-recreate
docker-compose logs -f --no-color > "log/wikibase.$1.log" &

# run status checks and wait until containers start
docker-compose $SUITE_CONFIG -f docker-compose-curl-test.yml build wikibase-test
docker-compose $SUITE_CONFIG -f docker-compose-curl-test.yml run wikibase-test

export SUITE=$1

docker-compose \
    $SUITE_CONFIG -f docker-compose-selenium-test.yml \
    run \
    wikibase-selenium-test npm run "test:$1"

#docker-compose down