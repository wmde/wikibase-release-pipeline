#!/usr/bin/env bash

set -e

cd test

TEST_RUNNER_COMPOSE="docker compose --env-file ../variables.env --env-file default.env --env-file ../local.env -f docker-compose.yml"

# check if command line argument is empty or not present
if [ -z $1 ]; then
        echo 'Please enter either a suite name, or "down" to take down services'
        exit 0
elif [ "$1" == 'down' ]; then
        $TEST_RUNNER_COMPOSE down --volumes
        exit 0
else
        export SUITE=$1
fi

if [ -z "$SUITE" ]; then
    echo "🚨 SUITE is not set"
    exit 1
fi

$TEST_RUNNER_COMPOSE up -d

WDIO_COMMAND='npm run test:run --silent'

if [ -n "$FILTER" ]; then
    WDIO_COMMAND='npm run test:run-filter --silent'
fi

if [[ -n "${HEADED_TESTS}" ]]; then
    echo "💻 Open http://localhost:7900/?autoconnect=1&resize=scale&password=secret to observe headed tests." 2>&1 | tee -a "$TEST_LOG"
fi

$TEST_RUNNER_COMPOSE run --rm test-runner -c "$WDIO_COMMAND"
$TEST_RUNNER_COMPOSE down --volumes
