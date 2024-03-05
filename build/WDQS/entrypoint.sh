#!/usr/bin/env bash
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

export BLAZEGRAPH_OPTS="${BLAZEGRAPH_EXTRA_OPTS} -DwikibaseHost=${WIKIBASE_HOST}"
export UPDATER_OPTS="-DwikibaseHost=${WIKIBASE_HOST} -DwikibaseMaxDaysBack=${WIKIBASE_MAX_DAYS_BACK}"

envsubst < /templates/mwservices.json > /wdqs/mwservices.json
chown blazegraph:blazegraph /wdqs/mwservices.json

# The data directory should always be owned by the blazegraph user
# This used to be owned by root (https://phabricator.wikimedia.org/T237248)
if [ -d /wdqs/data/ ]; then
  chown blazegraph:blazegraph -R /wdqs/data/
fi

# Start Blazegraph as the blazegraph user, forwardin the path so java is available
su --preserve-environment --command "export PATH=$PATH; /runBlazegraph.sh" blazegraph
