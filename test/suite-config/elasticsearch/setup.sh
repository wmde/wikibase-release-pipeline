#!/bin/sh

# still run the original tests
# shellcheck disable=SC1091
. check_if_up.sh

# Elasticsearch test
check_if_up "$MW_ELASTIC_HOST:$MW_ELASTIC_PORT"