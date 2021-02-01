#!/bin/sh

# still run the original tests
sh /test_curl.sh

# QuickStatements test
if curl --fail --retry 60 --retry-all-errors --retry-delay 1 --max-time 10 --retry-max-time 60 --show-error --output /dev/null --silent "$WIKIBASE_CLIENT_SERVER"/; then
    echo 'Successfully loaded the Wikibase Client server!'
else
    echo "Could not retrieve Wikibase Client server"
    exit 1
fi 