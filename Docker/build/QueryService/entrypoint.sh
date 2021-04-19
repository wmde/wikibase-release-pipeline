#!/bin/bash
# This file is provided by the wikibase/wdqs docker image.

# Test if required environment variables have been set
REQUIRED_VARIABLES=(WIKIBASE_HOST WDQS_HOST WDQS_PORT)
for i in "${REQUIRED_VARIABLES[@]}"; do
    eval THISSHOULDBESET=\$"$i"
    if [ -z "$THISSHOULDBESET" ]; then
    echo "$i is required but isn't set. You should pass it to docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file";
    exit 1;
    fi
done

set -eu

if [ -z ${WIKIBASE_CONCEPT_URI+x} ]; then
  export WIKIBASE_CONCEPT_URI=$WIKIBASE_SCHEME'://'$WIKIBASE_HOST
fi

export BLAZEGRAPH_OPTS="-DwikibaseHost=${WIKIBASE_HOST} -DwikibaseConceptUri=${WIKIBASE_CONCEPT_URI}"
export UPDATER_OPTS="-DwikibaseHost=${WIKIBASE_HOST} -DwikibaseMaxDaysBack=${WIKIBASE_MAX_DAYS_BACK} -DwikibaseConceptUri=${WIKIBASE_CONCEPT_URI}"

envsubst < /templates/mwservices.json > /wdqs/mwservices.json
chown 666:66 /wdqs/mwservices.json

# The data directory should always be owned by the blazegraph user
# This used to be owned by root (https://phabricator.wikimedia.org/T237248)
if [ -d /wdqs/data/ ]; then
  chown 666:66 -R /wdqs/data/
fi

su-exec 666:66 "$@"
