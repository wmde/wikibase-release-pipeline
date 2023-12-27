#!/usr/bin/env bash

# For real life replace "--env-file ../local.env"" with "--env-file ./.env"
export EXAMPLE_COMPOSE="docker compose \
--file docker-compose.yml \
--file docker-compose.extra.yml \
--env-file template.env \
--env-file ../local.env"

# `DEBUG=true <script>` make Docker operations visible
if [ -z "$DEBUG" ]; then
	EXAMPLE_COMPOSE="$EXAMPLE_COMPOSE --progress quiet"
fi

export EXAMPLE_COMPOSE_UP="$EXAMPLE_COMPOSE up -d --wait"
export EXAMPLE_COMPOSE_DOWN="$EXAMPLE_COMPOSE down"
export EXAMPLE_COMPOSE_RESET="$EXAMPLE_COMPOSE down --volumes --timeout 1"

function example__stop {
	local running
	running=$($EXAMPLE_COMPOSE ps --quiet)
	if [ -n "$running" ]; then
		echo "Stopping the currently running Wikibase Suite"
		$EXAMPLE_COMPOSE_DOWN
	fi
}

function example__reset {
	read -p "This will destroy all data. Are you sure? (N) " -n 1 -r
	echo    # (optional) move to a new line
	if [[ $REPLY =~ ^[Yy]$ ]]; then
		echo "Bringing down Wikibase Suite and removing data"
		$EXAMPLE_COMPOSE_RESET
	fi
}

function example__start {
	example__stop
	echo "Waiting for Wikibase Suite to start..."
	$EXAMPLE_COMPOSE_UP
	echo "Ready"
	echo
	echo "To stop running the Wikibase Suite: \"./suite.sh stop\""
	echo "To stop running the Wikibase Suite and RESET ALL DATA: \"./suite.sh reset\""
	echo
}

export EXAMPLE_EXEC_CMD="$TEST_COMPOSE exec test-runner -c"

# `--command`, `-c`: Run as ``./suite.sh --command <containerName> <command>` to run a command
# in a Wikibase Suite container container. Alias `-c`. Exits without running any subsequent
# code. Examples and common usage:
# `./suite.sh -c wikibase bash`
if [[ "$1" = "--command" ]] || [[ "$1" = "-c" ]]; then
	$EXAMPLE_COMPOSE exec "$2" "${*:3}"
	exit 0
fi

if [[ "$1" = "reset" ]] || [[ "$1" = "--reset" ]] || [[ "$2" = "--reset" ]]; then
	example__reset
fi

if [[ "$1" = "stop" ]]; then
	example__stop
	exit 0
fi

if [[ "$1" = "start" ]]; then
	example__start
	exit 0
fi
