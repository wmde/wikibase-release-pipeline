#!/bin/bash
# shellcheck disable=SC2086
set -ex

export SUITE=$1

if [ -n "$FILTER" ]; then
    export FILTER="--spec $FILTER"
fi

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

ALL_SUITES_FILES="$(find suite-config/ -name "docker-compose.override.yml")"
ALL_SUITES=""
for FILE in $ALL_SUITES_FILES; do
    ALL_SUITES="$ALL_SUITES -f $FILE"
done

if [ -f "$SUITE_OVERRIDE" ]; then
    echo "Using docker-compose override file $SUITE_OVERRIDE"
    SUITE_CONFIG="$DEFAULT_SUITE_CONFIG -f $SUITE_OVERRIDE"
fi

# remove reporter log
rm -f "log/selenium/result-$SUITE.json"

# stop any dangling things
docker-compose $DEFAULT_SUITE_CONFIG $ALL_SUITES -f docker-compose-selenium-test.yml down --volumes

# start container with settings
STRING_DATABASE_IMAGE_NAME=${DATABASE_IMAGE_NAME//[^a-zA-Z_0-9]/_}
docker-compose $SUITE_CONFIG up -d --force-recreate
docker-compose $SUITE_CONFIG logs -f --no-color > "log/wikibase.$STRING_DATABASE_IMAGE_NAME.$1.log" &

# run status checks and wait until containers start
docker-compose $SUITE_CONFIG -f docker-compose-curl-test.yml build wikibase-test
docker-compose $SUITE_CONFIG -f docker-compose-curl-test.yml run wikibase-test

docker-compose \
    $SUITE_CONFIG -f docker-compose-selenium-test.yml \
    run \
    wikibase-selenium-test npm run "test:run"