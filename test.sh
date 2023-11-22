#!/usr/bin/env bash

set -e

cd test

TEST_RUNNER_COMPOSE="docker compose --env-file ../variables.env --env-file default.env --env-file ../local.env -f docker-compose.yml"

export SUITE=$1
export SPEC_FILE=$2

if [ -z "$SUITE" ]; then
    echo "🚨 SUITE is not set"
    exit 1
fi

$TEST_RUNNER_COMPOSE up -d --build --scale test-runner=0 > /dev/null 2>&1

if [ -n "$SPEC_FILE" ]; then
    WDIO_COMMAND='npm run test:run-spec-file --silent'
else
    WDIO_COMMAND='npm run test:run --silent'
fi

$TEST_RUNNER_COMPOSE run --rm test-runner -c "$WDIO_COMMAND"

if [[ -n "${HEADED_TESTS}" ]]; then
    echo "💻 Open http://localhost:7900/?autoconnect=1&resize=scale&password=secret to observe headed tests." 2>&1 | tee -a "$TEST_LOG"
fi

$TEST_RUNNER_COMPOSE down --volumes > /dev/null 2>&1
