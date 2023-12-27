#!/usr/bin/env bash

export EXAMPLE_COMPOSE="docker compose \
--file docker-compose.yml \
--file docker-compose.extra.yml \
--env-file template.env \
--env-file ../local.env"

# `DEBUG=true <script>` make Docker operations visible
if [ -z "$DEBUG" ]; then
	EXAMPLE_COMPOSE="$EXAMPLE_COMPOSE --progress quiet"
fi


function example__reset {
	local running
	running=$($EXAMPLE_COMPOSE ps --quiet)
	if [ -n "$running" ]; then
    echo "Taking down Wikibase Suite example and removing data"
		$EXAMPLE_COMPOSE down --volumes
    echo "DONE."
  else
    echo "Example not currently running"
	fi
}

export EXAMPLE_EXEC_CMD="$TEST_COMPOSE exec test-runner -c"

# `--command`, `-c`: Run as ``,/<script>.sh --command <command>` to run a command
# on the `test-runner` container. Alias `-c`. Exits without running any subsequent
# code. Examples and common usage:
# `./tesh.sh --command npm install`
# `./tesh.sh -c bash`
if [[ "$1" = "--command" ]] || [[ "$1" = "-c" ]]; then
	$EXAMPLE_COMPOSE exec "$2" "${*:3}"
	exit 0
fi

if [[ "$1" = "reset" ]] || [[ "$1" = "-c" ]]; then
  example__reset
  exit 0
fi

echo "Running Wikibase Suite example in the background"
echo
echo "Waiting for services to start..."

$EXAMPLE_COMPOSE up --wait -d

echo "DONE. To stop running the example and reset the data run "./run.sh reset""
