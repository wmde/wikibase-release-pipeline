#!/usr/bin/env bash

function welcome_setup {
	if ! [[ -f ".env" ]]; then
		# Green text
		echo -e "\033[32m"
		echo "Welcome to the Wikibase Suite (WBS)!"
		# White text
		echo -e "\033[0;37m"
		echo "A new default configuration has been copied from \`template.env\` to \`.env\`"
		echo

		# there should always be a `.env` file present or the Docker compose run will bail
		cp template.env .env
		
		echo "Next steps:"
		echo
		echo "1. Open \`.env\` in an editor, set your own passwords and confirm the configuration"

		if [[ "$1" = "start" ]]; then
			echo "2. Run \`./wbs.sh start\` again to launch WBS"
		else
			echo "2. Run \`./wbs.sh start\` to launch WBS"
		fi
		
		echo "3. Once you see \"READY\", navigate to http://wikibase.berlinresidency.art and begin testing!"
		# Yellow text
		echo -e "\033[0;33m"
		echo "DISCLAIMER: This WBS configuration is an example how to use the WBS Docker images together."
		echo "It is a good starting place, but is not production ready."
		echo

		exit 0
	fi
}

welcome_setup $1

export EXAMPLE_COMPOSE="docker compose \
--file docker-compose.yml \
--file docker-compose.extra.yml \
--file docker-compose.nginx-proxy.yml \
--env-file .env \
--env-file ../local.env"

# `DEBUG=true wbs.sh` makes Docker operations visible
if [ -z "$DEBUG" ]; then
	EXAMPLE_COMPOSE="$EXAMPLE_COMPOSE --progress quiet"
fi

function start {
	stop
	echo
	echo "Waiting for Wikibase Suite to start..."
	trap stop SIGINT
	$EXAMPLE_COMPOSE up -d --wait
	echo -e "\033[32m"
	echo "READY"
	echo -e "\033[0;37m"
	echo "To stop running the Wikibase Suite: \"./wbs.sh stop\""
	echo "To stop running the Wikibase Suite and RESET ALL DATA: \"./wbs.sh reset\""
	echo
}

function stop {
	local running
	running=$($EXAMPLE_COMPOSE ps --quiet)
	if [ -n "$running" ]; then
		echo "Stopping the currently running Wikibase Suite..."
		$EXAMPLE_COMPOSE down
	fi
}

function reset_data {
	read -p "Erase all WBS data? This can't be undone. (No) " -n 1 -r
	echo
	if [[ $REPLY =~ ^[Yy]$ ]]; then
		echo "Stopping the currently running Wikibase Suite and removing data..."
		$EXAMPLE_COMPOSE down --volumes --remove-orphans
		echo "DONE"
	fi
}

function backup_and_reset_config {
	echo "Copy over your current configuration in \`.env\` with the contents of \`template.env\`?"
	read -p "If a current \`.env\` exists a backup of it will be created. (No) " -n 1 -r
	echo
	if [[ $REPLY =~ ^[Yy]$ ]]; then
		if [[ -f ".env" ]]; then
			# TODO: Save existing backup config, renaming existing `.env_backup` to `.env_backup_1` or similar.
			echo "Existing \`.env\` was saved to \`.env_backup\`"
			cp .env .env_backup
		fi
		cp template.env .env
		echo "DONE"
	fi
	echo
}

# `exec` command, e.g. `./wbs.sh exec <dockerContainerName> <command>`
# Runs a command in a WBS container.
# Example usage: `./wbs.sh exec wikibase bash`
if [[ "$1" = "--command" ]] || [[ "$1" = "-c" ]]; then
	trap stop SIGINT
	$EXAMPLE_COMPOSE exec "$2" "${*:3}"
	exit 0
fi

# `reset` command or `--reset` flag
# Prompts user about resetting data and/or the WBS configuration
if [[ "$1" = "reset" ]] || [[ "$1" = "--reset" ]] || [[ "$2" = "--reset" ]]; then
	echo
	backup_and_reset_config
	reset_data
	echo
fi

# `stop` command, e.g `./wbs.sh start`
# Starts (or restarts if already running) all WBS services.
# Accepts `--reset` flag.
if [[ "$1" = "start" ]]; then
	echo
	start
	exit 0
fi

# `stop` command
# Stops all running WBS services.
# Accepts `--reset` flag.
if [[ "$1" = "stop" ]]; then
	echo
	stop
	exit 0
fi
