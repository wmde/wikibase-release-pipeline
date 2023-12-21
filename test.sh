#!/usr/bin/env bash
set -e
source ./test/scripts/testRunnerSetup.sh

if ! [ "$2" = "--setup" ]; then
	trap down_test_runner EXIT
fi

down_test_runner

$TEST_RUNNER_COMPOSE up -d --build
$TEST_RUNNER_COMPOSE run --rm test-runner -c "npx ts-node cli.ts ${*:1}"
