#!/bin/sh

# still run the original tests
sh /test_curl.sh

# QuickStatements test
if curl --fail --retry 60 --retry-all-errors --retry-delay 1 --max-time 10 --retry-max-time 60 --show-error --output /dev/null --silent "$QS_SERVER"/; then
    echo 'Successfully loaded the QuickStatements server!'
else
    echo "Could not retrieve QuickStatements server"
    exit 1
fi