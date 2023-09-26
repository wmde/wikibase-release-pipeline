#!/usr/bin/env bash
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# debug every invocation
set -x

image_name="$1"

docker build \
    -t "$image_name" \
    Docker/build/WDQS-proxy/
