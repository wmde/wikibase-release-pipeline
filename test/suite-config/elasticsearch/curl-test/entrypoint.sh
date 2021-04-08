#!/bin/sh

# still run the original tests
# shellcheck disable=SC1091
. /test_curl.sh

# QuickStatements test
echo "$MW_ELASTIC_HOST:$MW_ELASTIC_PORT"
check_if_up "$MW_ELASTIC_HOST:$MW_ELASTIC_PORT"