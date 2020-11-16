#!/bin/bash

# Wikibase test
if curl --fail --show-error --output /dev/null --silent $WIKIBASE_SERVER/wiki/Main_Page; then
    echo 'Successfully loaded the wiki main page!'
else
    echo "Could not retrieve main page"
    exit 1
fi

# QueryService test blazegraph root page
if curl --fail --show-error --output /dev/null --silent $QUERYSERVICE_SERVER/bigdata/namespace/wdq/sparql; then
    echo 'Successfully loaded the root page!'
else
    echo "Could not retrieve root page"
    exit 1
fi

# QueryService test simple SPARQL query
if curl --fail --show-error --output /dev/null --silent $QUERYSERVICE_SERVER/bigdata/namespace/wdq/sparql; then
    echo 'Successfully loaded the root page!'
else
    echo "Could not retrieve root page"
    exit 1
fi


echo curl '$QUERYSERVICE_SERVER/bigdata/namespace/wdq/sparql' \ 
    -H 'User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:82.0) Gecko/20100101 Firefox/82.0' \ 
    -H 'Accept: application/sparql-results+json' \ 
    -H 'Accept-Language: en-US,en;q=0.5' \ 
    --compressed \ 
    -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \ 
    -H 'X-Requested-With: XMLHttpRequest' \ 
    -H 'Origin: http://localhost:8989' \ 
    -H 'Connection: keep-alive' \
    -H 'Referer: http://localhost:8989/bigdata/' \
    --data-raw 'query=+SELECT+*+WHERE%7B+%3Fs+%3Fp+%3Fo+%7D' \
    --fail \ 
    --show-error
    #--output /dev/null \
    #--silent


# QueryService UI test
if curl --fail --show-error --output /dev/null --silent $QUERYSERVICE_UI_SERVER/; then
    echo 'Successfully loaded the UI root page!'
else
    echo "Could not retrieve UI root page"
    exit 1
fi


