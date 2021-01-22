#!/bin/bash
# shellcheck disable=SC2086
set -ex

export SUITE=$1

if [ -z "$SUITE" ]; then
    echo "SUITE is not set"
    exit 1
fi

DEFAULT_SUITE_CONFIG="-f docker-compose.yml"
SUITE_OVERRIDE="suite-config/$SUITE/docker-compose.override.yml"
SUITE_CONFIG="$DEFAULT_SUITE_CONFIG"


if [ -f "$SUITE_OVERRIDE" ]; then
    echo "Using docker-compose override file $SUITE_OVERRIDE"
    SUITE_CONFIG="$DEFAULT_SUITE_CONFIG -f $SUITE_OVERRIDE"
fi

# stop any dangling things
docker-compose $SUITE_CONFIG -f docker-compose-selenium-test.yml down

# start container with settings
docker-compose $SUITE_CONFIG up -d --force-recreate
docker-compose logs -f --no-color > "log/wikibase.$1.log" &

# run status checks and wait until containers start
docker-compose $SUITE_CONFIG -f docker-compose-curl-test.yml build wikibase-test
docker-compose $SUITE_CONFIG -f docker-compose-curl-test.yml run wikibase-test


docker-compose \
    $SUITE_CONFIG -f docker-compose-selenium-test.yml \
    run \
    wikibase-selenium-test npm run "test:$1"