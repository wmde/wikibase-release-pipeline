#!/bin/bash

# Wikibase test
if curl --fail  --retry 5 --retry-all-errors --retry-delay 10 --max-time 10 --retry-max-time 60 --show-error --output /dev/null --silent "$WIKIBASE_SERVER"/wiki/Main_Page; then
    echo 'Successfully loaded the wiki main page!'
else
    echo "Could not retrieve main page"
    exit 1
fi

# QueryService test blazegraph root page
if curl --fail --show-error --output /dev/null --silent "$QUERYSERVICE_SERVER"/bigdata/namespace/wdq/sparql; then
    echo 'Successfully loaded the QueryService page!'
else
    echo "Could not retrieve root page"
    exit 1
fi

# QueryService UI test
if curl --fail --show-error --output /dev/null --silent "$QUERYSERVICE_UI_SERVER"/; then
    echo 'Successfully loaded the QueryService UI page!'
else
    echo "Could not retrieve UI root page"
    exit 1
fi

# QueryService test simple SPARQL query
SPARQL_QUERY='SELECT * WHERE{ ?s ?p ?o }'
echo "Executing SPARQL query $SPARQL_QUERY ..."
curl "$QUERYSERVICE_SERVER/bigdata/namespace/wdq/sparql" \
    --compressed \
    --data-urlencode "query=$SPARQL_QUERY" \
    --silent \
    --fail \
    --show-error \
    --output /dev/null || exit 1

# QuickStatements test
if curl --fail --show-error --output /dev/null --silent "$QS_SERVER"/; then
    echo 'Successfully loaded the QuickStatements server!'
else
    echo "Could not retrieve QuickStatements server"
    exit 1
fi