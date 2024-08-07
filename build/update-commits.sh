#!/usr/bin/env bash

# Change to the directory where the script is located
cd "$(dirname "${BASH_SOURCE[0]}")" || exit

# The previous Python version:
# python3 update_commits.py "$1/build.env"

pnpm exec node --loader ts-node/esm build/update-commits.ts "$1/build.env"
