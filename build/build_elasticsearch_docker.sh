#!/bin/bash
set -e

echo "Building elasticseach $ELASTICSEARCH_VERSION"
docker build \
    --build-arg=ELASTICSEARCH_VERSION="$ELASTICSEARCH_VERSION" \
    --build-arg=ELASTICSEARCH_PLUGIN_VERSION="$ELASTICSEARCH_PLUGIN_VERSION" \
    Docker/build/Elasticsearch/ -t "$1"

docker save "$1" | gzip -"$GZIP_COMPRESSION_RATE"f > "$(pwd)"/artifacts/elasticsearch.docker.tar.gz
