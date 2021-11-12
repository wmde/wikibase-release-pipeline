#!/bin/bash
# shellcheck disable=SC2086
set -e

export SUITE=$1
export SLOW=$2

BUILD_IMAGES=$SLOW

# if prepended with base__ we might still want to use the bundle config
if [[ $SUITE == base__* ]] && [ ! -d "suite-config/$SUITE" ] ; then
    SUITE_CONFIG_NAME=${SUITE//base__/}
else
    SUITE_CONFIG_NAME=$SUITE
fi

# set suite localsettings
export LOCALSETTINGS_VARIANT=$SUITE_CONFIG_NAME

if [ ! -d "suite-config/$SUITE_CONFIG_NAME" ]; then
    echo "Suite $SUITE_CONFIG_NAME does not exist"
    exit 1
fi

DEFAULT_SUITE_CONFIG="-f docker-compose.yml"
SUITE_OVERRIDE="suite-config/$SUITE_CONFIG_NAME/docker-compose.override.yml"
SUITE_CONFIG="$DEFAULT_SUITE_CONFIG"

if [ -f "$SUITE_OVERRIDE" ]; then
    echo "Using docker-compose override file $SUITE_OVERRIDE"
    SUITE_CONFIG="$DEFAULT_SUITE_CONFIG -f $SUITE_OVERRIDE"
fi

# start container with settings
STRING_DATABASE_IMAGE_NAME=${DATABASE_IMAGE_NAME//[^a-zA-Z_0-9]/_}
docker-compose $SUITE_CONFIG up -d --force-recreate
docker-compose $SUITE_CONFIG logs -f --no-color > "log/wikibase.$STRING_DATABASE_IMAGE_NAME.$1.log" &

# run status checks and wait until containers start
if [[ $BUILD_IMAGES == 'true' ]]; then
    docker-compose $SUITE_CONFIG -f docker-compose-curl-test.yml build wikibase-test
fi
docker-compose $SUITE_CONFIG -f docker-compose-curl-test.yml run wikibase-test

NODE_COMMAND='test:run'
if [ -n "$FILTER" ]; then
    NODE_COMMAND='test:run-filter'
fi

docker-compose \
    $SUITE_CONFIG -f docker-compose-selenium-test.yml \
    run \
    wikibase-selenium-test bash -c "rm -f /usr/src/app/log/selenium/result-$SUITE.json && npm run $NODE_COMMAND"