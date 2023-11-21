#!/usr/bin/env bash

#!/usr/bin/env bash
set -e

cd test

export SUITE=$1

if [ -z "$SUITE" ]; then
    echo "🚨 SUITE is not set"
    exit 1
fi

TEST_RUNNER_COMPOSE="docker compose --env-file ../variables.env --env-file default.env --env-file ../local.env -f docker-compose.yml"
$TEST_RUNNER_COMPOSE up -d

WDIO_COMMAND='npm run test:run --silent'

if [ -n "$FILTER" ]; then
    WDIO_COMMAND='npm run test:run-filter --silent'
fi

$TEST_RUNNER_COMPOSE run --rm test-runner -c "$WDIO_COMMAND"
$TEST_RUNNER_COMPOSE down --volumes
