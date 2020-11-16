#!/bin/bash

# Wikibase test
if curl --fail --show-error --output /dev/null --silent $WIKIBASE_SERVER/wiki/Main_Page; then
    echo 'Successfully loaded the wiki main page!'
else
    echo "Could not retrieve main page"
    exit 1
fi


# QueryService test
if curl --fail --show-error --output /dev/null --silent $QUERYSERVICE_SERVER/; then
    echo 'Successfully loaded the root page!'
else
    echo "Could not retrieve root page"
    exit 1
fi

# QueryService UI test
if curl --fail --show-error --output /dev/null --silent $QUERYSERVICE_UI_SERVER/; then
    echo 'Successfully loaded the UI root page!'
else
    echo "Could not retrieve UI root page"
    exit 1
fi