#!/bin/bash

STATUSCODE=$(curl --fail --show-error --output /dev/null --silent $WIKIBASE_SERVER/wiki/Main_Page)
exit $STATUSCODE