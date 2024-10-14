#!/usr/bin/env bash
# This file is provided by the wikibase/wdqs docker image.

set +u
if [ -z "$WIKIBASE_CONCEPT_URI" ]; then
  echo "WIKIBASE_CONCEPT_URI is required but isn't set.";
  exit 1;
fi
set -u

cd /wdqs || exit

/wait-for-it.sh "$WIKIBASE_HOST:80" -t 300 -- \
/wait-for-it.sh "$WDQS_HOST:$WDQS_PORT" -t 300 -- \
./runUpdate.sh -h http://"$WDQS_HOST":"$WDQS_PORT" -- --wikibaseUrl "$WIKIBASE_SCHEME"://"$WIKIBASE_HOST" --conceptUri "$WIKIBASE_CONCEPT_URI" --entityNamespaces "$WDQS_ENTITY_NAMESPACES"
