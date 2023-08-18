#!/bin/sh

HOSTNAME_OR_BASE_URL=$1
PATH=$2

HOSTNAME=$(echo "$HOSTNAME_OR_BASE_URL" | /bin/sed -E 's/^\s*.*:\/\///g')
HOSTNAME_AND_PATH="$HOSTNAME$PATH"
DISPLAY_URL="http://$HOSTNAME_AND_PATH"

if [ -z "$HOSTNAME_AND_PATH" ]; then
    echo "❌ check_if_up called with an empty URL (with PATH: $PATH)"

    return
fi

if ! (/usr/bin/curl --fail --output /dev/null --silent "$HOSTNAME_AND_PATH";) then
    echo "🔄 Waiting for $DISPLAY_URL"

    if ! (/usr/bin/curl --fail --retry 240 --retry-all-errors --retry-delay 1 --max-time 10 --retry-max-time 240 --output /dev/null --silent "$HOSTNAME_AND_PATH";) then
        echo "❌ Could not load $DISPLAY_URL"
        exit 1
    fi
fi

echo "ℹ️  Successfully loaded $DISPLAY_URL"
