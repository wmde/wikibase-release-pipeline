#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Determine the directory of the script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

set -o allexport
# shellcheck disable=SC1091
source "$SCRIPT_DIR/build.env"

# Find and source all build.env files in the $SCRIPT_DIR/build/*/ directories
for build_env_file in "$SCRIPT_DIR"/*/build.env; 
do 
    # shellcheck disable=SC1091
    source "$build_env_file"; 
done

if [ -f "$SCRIPT_DIR/../local.env" ]; then
    # shellcheck disable=SC1091
    source "$SCRIPT_DIR/../local.env"
fi
set +o allexport

docker compose -f "$SCRIPT_DIR/docker-compose.build.yml" "$@"
