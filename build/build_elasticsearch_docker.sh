#!/usr/bin/env bash
set -e

image_name="$1"

echo "Building elasticseach $ELASTICSEARCH_VERSION"
docker build \
    --build-arg=ELASTICSEARCH_VERSION="$ELASTICSEARCH_VERSION" \
    --build-arg=ELASTICSEARCH_PLUGIN_EXTRA_VERSION="$ELASTICSEARCH_PLUGIN_EXTRA_VERSION" \
    -t "$image_name" \
    Docker/build/Elasticsearch/

build/docker_tag.sh "$image_name"

docker save \
    "$image_name" \
    "${DOCKER_REPOSITORY_NAME}/${image_name}" \
    "${DOCKER_REPOSITORY_NAME_WIP}/${image_name}" \
    | gzip -"$GZIP_COMPRESSION_RATE" \
    > "$(pwd)"/artifacts/${image_name}.docker.tar.gz
