#!/bin/bash

/wait-for-it.sh "$WIKIBASE_SCHEME_AND_HOST":80 -t 20
/entrypoint.sh