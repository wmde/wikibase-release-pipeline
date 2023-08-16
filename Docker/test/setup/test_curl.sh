#!/bin/sh

check_if_up() {
    URL=$1
    PATH=$2

    FULL_URL="$1$2"
    DISPLAY_URL="http://$FULL_URL"

    if [ -z "$URL" ]; then
        echo "❌ check_if_up called with an empty URL (with PATH: $PATH)"

        return
    fi

    if ! (/usr/bin/curl --fail --output /dev/null --silent "$FULL_URL";) then
        echo "🔄 Waiting for $DISPLAY_URL"

        if ! (/usr/bin/curl --fail --retry 120 --retry-all-errors --retry-delay 1 --max-time 600 --retry-max-time 120 --output /dev/null --silent "$FULL_URL";) then
            echo "❌ Could not load $DISPLAY_URL"
            exit 1
        fi
    fi

    echo "ℹ️  Successfully loaded $DISPLAY_URL"
}

check_if_up "$WIKIBASE_SERVER" "/wiki/Main_Page"

if [ -z "$SKIP_WDQS" ]; then

    check_if_up "$WDQS_SERVER" "/bigdata/namespace/wdq/sparql"

    check_if_up "$WDQS_FRONTEND_SERVER" "/"

fi
