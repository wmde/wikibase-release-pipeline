#!/bin/bash
set -e

# Define the path to check for installed dependencies
# NODE_MODULES_DIR="/workspace/node_modules"

# # Check if node_modules directory exists
# if [ ! -d "$NODE_MODULES_DIR" ]; then
#   echo "node_modules not found. Running pnpm install..."
#   pnpm install --frozen-lockfile
# else
#   echo "node_modules found. Skipping pnpm install."
# fi
# pnpm config set store-dir /workspace/pnpm/store --global

exec pnpm nx "$@"
