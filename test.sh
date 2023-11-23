#!/usr/bin/env bash

set -e

SUITE_NAME=$1
SPEC_FILE=$2
WATCH=$3

if [ -z "$SUITE_NAME" ]; then
    echo "🚨 SUITE is not set"
    exit 1
fi

TEST_RUNNER_COMPOSE="docker compose --env-file ../variables.env --env-file default.env --env-file ../local.env -f docker-compose.yml"
WDIO_COMMAND="npx wdio suites/$SUITE_NAME/$SUITE_NAME.conf.ts --silent"

if [ -n "$SPEC_FILE" ]; then
    WDIO_COMMAND="$WDIO_COMMAND --spec $SPEC_FILE"
fi

if [ -n "$WATCH" ]; then
    WDIO_COMMAND="$WDIO_COMMAND --watch"
fi

cd test

$TEST_RUNNER_COMPOSE run --rm test-runner -c "$WDIO_COMMAND"
$TEST_RUNNER_COMPOSE down --volumes > /dev/null 2>&1
