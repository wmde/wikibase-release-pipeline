#!/usr/bin/env bash

if ! [[ -f "local.env" ]]; then
	touch local.env
fi

# Explicitly adds the Docker network wikibase-suite-test which is shared by both
# test runner and test services
docker network inspect wikibase-suite-test > /dev/null 2>&1 || \
  docker network create wikibase-suite-test > /dev/null

# `node_modules` is set to persist using a bind-mounteded Docker volume stored at
# `test/node_modules`, so we need to make sure that directory always exists before
# Docker runs or it will fail with an error
mkdir -p test/node_modules

# The test runner is currently configured and ran through `test/docker-compose.yml
# this is the set of docker compose CLI params that should always be used when
# running it. Note that this compose command assumes it is ran from the root
# directory of the project, not from within the `test` directory
export TEST_COMPOSE="docker compose \
--file test/docker-compose.yml \
--env-file test/test-runner.env \
--env-file local.env \
--project-directory test"

# `DEBUG=true <script>` make Docker operations visible
if [ -z "$DEBUG" ]; then
	TEST_COMPOSE="$TEST_COMPOSE --progress quiet"
fi

# Standard way to run commmands on the test runner. Always builds, and removes the
# test-runner container after use
export RUN_TEST_RUNNER_CMD="$TEST_COMPOSE run --rm --build --service-ports test-runner -c"

# `--command`, `-c`: Run as ``,/<script>.sh --command <command>` to run a command
# on the `test-runner` container. Alias `-c`. Exits without running any subsequent
# code. Examples and common usage:
# `./tesh.sh --command npm install`
# `./tesh.sh -c bash`
if [[ "$1" = "--command" ]] || [[ "$1" = "-c" ]]; then
	$RUN_TEST_RUNNER_CMD "${*:2}"
	exit 0
fi

function test_runner__down {
	local running
	running=$($TEST_COMPOSE ps --quiet)
	if [ -n "$running" ]; then
		$TEST_COMPOSE down
	fi
}
