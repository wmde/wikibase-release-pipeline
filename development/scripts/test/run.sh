#!/usr/bin/env bash

# Change to the directory where the script is located
cd "$(dirname "${BASH_SOURCE[0]}")/../.." || exit

# Must in Docker environment to access test-services by Docker network names
# If not running in Docker, start the build-tools container and run the script again there
if [[ ! -f /.dockerenv  ]]; then
  # Make sure the docker network exists
  docker network create wbs-dev > /dev/null 2>&1 || true

  exec docker compose --progress quiet run --build --rm runner -c 'scripts/test/run.sh "$@"' -- "$@"
fi

NODE_NO_WARNINGS=1 pnpm exec tsx scripts/test/cli.ts "$@"
