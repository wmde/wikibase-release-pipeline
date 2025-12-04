#!/usr/bin/env bash
set -e

# Check if IS_JOBRUNNER is set to "true"
if [ "$IS_JOBRUNNER" = "true" ]; then
    exec /jobrunner-entrypoint.sh "$@"
else
    exec /mediawiki-entrypoint.sh "$@"
fi
