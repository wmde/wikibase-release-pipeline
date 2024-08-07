#!/usr/bin/env bash

# Change to the directory where the script is located
cd "$(dirname "${BASH_SOURCE[0]}")" || exit

NODE_NO_WARNINGS=1 node --require ts-node/register --loader=ts-node/esm cli.ts "$@"
