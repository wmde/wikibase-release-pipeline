#!/usr/bin/env bash
# This file is provided by the wikibase/wdqs docker image.

cd /wdqs || exit

./runUpdate.sh -h "$WDQS_SCHEME"://"$WDQS_HOST":"$WDQS_PORT" -- --wikibaseUrl "$WIKIBASE_SCHEME"://"$WIKIBASE_HOST":"$WIKIBASE_PORT" --conceptUri "$WIKIBASE_SCHEME"://"$WIKIBASE_HOST":"$WIKIBASE_PORT" --entityNamespaces "$WDQS_ENTITY_NAMESPACES"
