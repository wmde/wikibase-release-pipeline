#!/usr/bin/env bash
set -e

export SUITE=$1

if [ ! -d "suite-config/$SUITE" ]; then
    echo "🚨 Suite $SUITE does not exist, exiting"  2>&1 | tee -a "$TEST_LOG"
    exit 1
fi

TEST_COMPOSE="docker compose -f docker-compose-selenium-test.yml $DEFAULT_SUITE_CONFIG"

# adding Docker compose override file for this suite if there is one
SUITE_OVERRIDE="suite-config/$SUITE/docker-compose.override.yml"
if [ -f "$SUITE_OVERRIDE" ]; then
    echo "ℹ️  Using docker compose override file $SUITE_OVERRIDE" 2>&1 | tee -a "$TEST_LOG"

    TEST_COMPOSE="$TEST_COMPOSE -f $SUITE_OVERRIDE"
fi

function remove_services_and_volumes {
    $TEST_COMPOSE down --volumes --remove-orphans --timeout 1 >> "$TEST_LOG" 2>&1 || true
}

echo "🔄 Removing existing Docker test services and volumes" 2>&1 | tee -a "$TEST_LOG"
remove_services_and_volumes

echo "🔄 Creating Docker test services and volumes" 2>&1 | tee -a "$TEST_LOG"
$TEST_COMPOSE up -d --build --scale wikibase-selenium-test=0 >> "$TEST_LOG" 2>&1
$TEST_COMPOSE logs -f --no-color >> "$TEST_LOG" &

# run global then suite setup.sh (waits until containers to start, etc)
$TEST_COMPOSE run --rm wikibase-selenium-test -c suite-config/setup.sh

echo -e "\n✳️  Running \"$SUITE\" test suite" 2>&1 | tee -a "$TEST_LOG"
WDIO_COMMAND='npm run test:run --silent'
if [ -n "$FILTER" ]; then
    WDIO_COMMAND='npm run test:run-filter --silent'
fi
$TEST_COMPOSE run --rm wikibase-selenium-test -c "$WDIO_COMMAND"

echo -e "🔄 \"$SUITE\" test suite run complete. Removing running Docker test services and volumes\n" 2>&1 | tee -a "$TEST_LOG"
remove_services_and_volumes
