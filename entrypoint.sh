#!/usr/bin/env bash
set -e

# Check if node_modules directory exists (does nothing if everythign is up-to-date)
if [ -f "pnpm-lock.yaml" ] && [ ! -d "node_modules" ]; then
  echo "pnpm-lock.yaml exists, running 'pnpm install --frozen-lockfile'"
  pnpm install --frozen-lockfile
elif ! [ -f "pnpm-lock.yaml" ]; then
  echo "pnpm-lock.yaml does not exist, running 'pnpm install'"
  pnpm install
fi

# Execute the command passed to the container
exec bash "$@"
