#!/usr/bin/env bash

set -e

exec NODE_NO_WARNINGS=1 npx --node-options='--require ts-node/register --loader=ts-node/esm' node cli.ts

# if ! [[ -f "../local.env" ]]; then
# 	touch ../local.env
# fi

# # Explicitly adds the Docker network wbs-test which is shared by both
# # test runner and test services
# docker network inspect wbs-test > /dev/null 2>&1 || \
#   docker network create wbs-test > /dev/null

# # The test runner is currently configured and ran through `test/docker-compose.yml
# # this is the set of docker compose CLI params that should always be used when
# # running it. Note that this compose command assumes it is ran from the root
# # directory of the project, not from within the `test` directory
# export TEST_COMPOSE="docker compose \
# --env-file test-runner.env \
# --env-file ../local.env"

# # `DEBUG=true <script>` make Docker operations visible
# if [ -z "$DEBUG" ]; then
# 	TEST_COMPOSE="$TEST_COMPOSE --progress quiet"
# fi

# # Standard way to run commmands on the test runner. Always builds, and removes the
# # runner container after use
# export RUN_TEST_RUNNER_CMD="$TEST_COMPOSE run --rm --build --service-ports runner -c"

# # `--command`, `-c`: Run as ``,/<script>.sh --command <command>` to run a command
# # on the `runner` container. Alias `-c`. Exits without running any subsequent
# # code. Examples and common usage:
# # `./tesh.sh --command npm install`
# # `./tesh.sh -c bash`
# if [[ "$1" = "--command" ]] || [[ "$1" = "-c" ]]; then
# 	$RUN_TEST_RUNNER_CMD "${*:2}"
# 	exit 0
# fi

# function test_runner__down {
# 	local running
# 	running=$($TEST_COMPOSE ps --quiet)
# 	if [ -n "$running" ]; then
# 		$TEST_COMPOSE down
# 	fi
# }

# if ! [ "$2" = "--setup" ]; then
# 	trap test_runner__down EXIT
# fi

# test_runner__down

# $TEST_COMPOSE up -d
# exec $RUN_TEST_RUNNER_CMD "npm run -s test --workspace test -- ${*:1}"
