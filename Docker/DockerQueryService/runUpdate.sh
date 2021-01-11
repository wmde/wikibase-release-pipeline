#!/usr/bin/env bash
# This file is provided by the wikibase/wdqs docker image.

cd /wdqs

# TODO env vars for entity namespaces, scheme and other settings
./runUpdate.sh -h http://$WDQS_HOST:$WDQS_PORT -- --wikibaseUrl $WIKIBASE_SCHEME://$WIKIBASE_HOST --conceptUri $WIKIBASE_SCHEME://$WIKIBASE_HOST --entityNamespaces $WDQS_ENTITY_NAMESPACES