#!/bin/sh
# shellcheck disable=SC1091

scripts/check_if_up.sh "$WDQS_SERVER" "/bigdata/namespace/wdq/sparql"
scripts/check_if_up.sh "$WDQS_FRONTEND_SERVER" "/"
