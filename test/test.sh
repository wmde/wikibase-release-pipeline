#!/usr/bin/env bash

# Change to the directory where the script is located
cd "$(dirname "${BASH_SOURCE[0]}")" || exit

# Make sure the docker network exists
docker network create wbs-dev > /dev/null 2>&1 || true

NODE_NO_WARNINGS=1 node --require ts-node/register --loader=ts-node/esm cli.ts "$@"
