#!/bin/sh

# still run the original tests
# shellcheck disable=SC1091
. /test_curl.sh

# QuickStatements test
check_if_up "$QS_SERVER"

# Client test
check_if_up "$WIKIBASE_CLIENT_SERVER" "/"