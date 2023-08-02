#!/usr/bin/env bash
# shellcheck disable=SC2086
set -e
set -x

export SUITE=$1

mkdir -p log

# set suite localsettings
export LOCALSETTINGS_VARIANT=$SUITE

if [ ! -d "suite-config/$SUITE" ]; then
    echo "Suite $SUITE does not exist"
    exit 1
fi

SUITE_OVERRIDE="suite-config/$SUITE/docker-compose.override.yml"
SUITE_CONFIG="$DEFAULT_SUITE_CONFIG"

if [ -f "$SUITE_OVERRIDE" ]; then
    echo "Using docker compose override file $SUITE_OVERRIDE"
    SUITE_CONFIG="$DEFAULT_SUITE_CONFIG -f $SUITE_OVERRIDE"
fi

# shut down the stack if running, remove volumes to start test suite on fresh db
docker compose \
    $SUITE_CONFIG -f docker-compose-selenium-test.yml \
    down --volumes --remove-orphans --timeout 1 || true

# start container with settings
STRING_DATABASE_IMAGE_NAME=${DATABASE_IMAGE_NAME//[^a-zA-Z_0-9]/_}
docker compose $SUITE_CONFIG up -d --force-recreate
docker compose $SUITE_CONFIG logs -f --no-color > "log/wikibase.$STRING_DATABASE_IMAGE_NAME.$1.log" &

docker compose \
    $SUITE_CONFIG -f docker-compose-selenium-test.yml \
    build \
    wikibase-selenium-test

# run status checks and wait until containers start
docker compose $SUITE_CONFIG -f docker-compose-curl-test.yml build wikibase-test
docker compose $SUITE_CONFIG -f docker-compose-curl-test.yml run wikibase-test

NODE_COMMAND='test:run'
if [ -n "$FILTER" ]; then
    NODE_COMMAND='test:run-filter'
fi

docker compose \
    $SUITE_CONFIG -f docker-compose-selenium-test.yml \
    run \
    wikibase-selenium-test bash -c "rm -f /usr/src/app/log/selenium/result-$SUITE.json && npm run $NODE_COMMAND"
