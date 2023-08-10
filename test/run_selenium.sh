#!/usr/bin/env bash
# shellcheck disable=SC2086
set -e

export SUITE=$1

# if prepended with base__ we might still want to use the bundle config
if [[ $SUITE == base__* ]] && [ ! -d "suite-config/$SUITE" ] ; then
    SUITE_CONFIG_NAME=${SUITE//base__/}
else
    SUITE_CONFIG_NAME=$SUITE
fi

# set suite localsettings
export LOCALSETTINGS_VARIANT=$SUITE_CONFIG_NAME

if [ ! -d "suite-config/$SUITE_CONFIG_NAME" ]; then
    echo "🚨 Suite $SUITE_CONFIG_NAME does not exist, exiting"
    exit 1
fi

SUITE_OVERRIDE="suite-config/$SUITE_CONFIG_NAME/docker-compose.override.yml"
SUITE_CONFIG="$DEFAULT_SUITE_CONFIG"

if [ -f "$SUITE_OVERRIDE" ]; then
    echo "ℹ️  Using docker compose override file $SUITE_OVERRIDE"
    SUITE_CONFIG="$DEFAULT_SUITE_CONFIG -f $SUITE_OVERRIDE"
fi

# shut down the stack if running, remove volumes to start test suite on fresh db
echo "🔄 Removing existing Docker test services and volumes" 
docker compose \
    $SUITE_CONFIG -f docker-compose-selenium-test.yml \
    down --volumes --remove-orphans --timeout 1 >> "$SETUP_LOG" 2>&1 || true

# create stack
echo "🔄 Creating Docker test services and volumes"
docker compose $SUITE_CONFIG up -d --force-recreate >> "$SETUP_LOG" 2>&1

# start containers with settings
docker compose $SUITE_CONFIG logs -f --no-color > "log/$SUITE/$SUITE.log" &

docker compose \
    $SUITE_CONFIG -f docker-compose-selenium-test.yml \
    build \
    wikibase-selenium-test >> "$SETUP_LOG" 2>&1

# run status checks and wait until containers start
docker compose $SUITE_CONFIG -f docker-compose-curl-test.yml build wikibase-test >> "$SETUP_LOG" 2>&1
docker compose $SUITE_CONFIG -f docker-compose-curl-test.yml run wikibase-test

NODE_COMMAND='test:run'
if [ -n "$FILTER" ]; then
    NODE_COMMAND='test:run-filter'
fi

echo ""
echo "✳️  Running \"$SUITE\" test suite"
echo ""

docker compose \
    $SUITE_CONFIG -f docker-compose-selenium-test.yml \
    run --user "$(id -u)" \
    wikibase-selenium-test bash -c "rm -f /usr/src/app/log/$SUITE/selenium-result.json && npm run $NODE_COMMAND --silent"
