#!/bin/bash

# Wikibase test
if curl --fail --show-error --output /dev/null --silent $WIKIBASE_SERVER/wiki/Main_Page; then
    echo 'Successfully loaded the wiki main page!'
else
    echo "Could not retrieve main page"
    exit 1
fi

# QueryService test
if curl --fail --show-error --output /dev/null --silent $WIKIBASE_SERVER/wiki/Main_Page; then
    echo 'Successfully loaded the wiki main page!'
else
    echo "Could not retrieve main page"
    exit 1
fi