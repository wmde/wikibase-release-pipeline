#!/usr/bin/env bash

# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -euo pipefail
IFS=$'\n\t'

# debug every invocation
set -x

image_name="$1"

docker build \
    --build-arg=ELASTICSEARCH_VERSION="$ELASTICSEARCH_VERSION" \
    --build-arg=ELASTICSEARCH_PLUGIN_EXTRA_VERSION="$ELASTICSEARCH_PLUGIN_EXTRA_VERSION" \
    -t "$image_name" \
    Docker/build/Elasticsearch/
