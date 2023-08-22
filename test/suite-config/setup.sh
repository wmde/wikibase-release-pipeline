#!/bin/bash
# shellcheck disable=SC1091

scripts/check_if_up.sh "$MW_SERVER" "/wiki/Main_Page"
scripts/check_if_up.sh "$WDQS_SERVER" "/bigdata/namespace/wdq/sparql"
scripts/check_if_up.sh "$WDQS_FRONTEND_SERVER" "/"

SUITE_SETUP_FILE="suite-config/$SUITE/setup.sh"

if [ -f "$SUITE_SETUP_FILE" ]; then
    echo "🔄 Running \"$SUITE_SETUP_FILE\"" 2>&1 | tee -a "$TEST_LOG"
    $SUITE_SETUP_FILE
fi
