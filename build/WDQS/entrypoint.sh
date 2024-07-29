#!/usr/bin/env bash
# This file is provided by the wikibase/wdqs docker image.

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

# Start as the blazegraph user.
# --preserve-environment does not preserve PATH, so we manually
# set the PATH again. Java cannot be found otherwise.
su --preserve-environment --command "export PATH=$PATH; $*" blazegraph
