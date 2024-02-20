#!/usr/bin/env bash

set -e
source ./test/scripts/test_runner_setup.sh

if ! [ "$2" = "--setup" ]; then
	trap test_runner__down EXIT
fi

test_runner__down

$TEST_COMPOSE up -d
$RUN_TEST_RUNNER_CMD "npm run -s test -- ${*:1}"
