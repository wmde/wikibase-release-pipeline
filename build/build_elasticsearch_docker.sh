#!/bin/bash
set -e

echo "Building elasticseach $ELASTICSEARCH_VERSION"
docker build \
    --build-arg=ELASTICSEARCH_VERSION="$ELASTICSEARCH_VERSION" \
    Docker/build/Elasticsearch/ -t "$1"

docker save "$1" | gzip -9f > "$(pwd)"/artifacts/elasticsearch.docker.tar.gz
