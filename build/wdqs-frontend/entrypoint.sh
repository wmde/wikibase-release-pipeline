#!/bin/sh
# This file is provided by the wikibase/wdqs-frontend docker image.

# Test if required environment variables have been set
if [ -z "$WIKIBASE_PUBLIC_URL" ]; then
	echo "Environment variable WIKIBASE_PUBLIC_URL is required but isn't set.";
	exit 1;
fi

if [ -z "$WDQS_PUBLIC_URL" ]; then
	echo "Environment variable WDQS_PUBLIC_URL is required but isn't set.";
	exit 1;
fi

set -eu
export DOLLAR='$'

# Generate initial config from template and put it to /config
if ! [ -e "/config/wdqs-frontend-config.json" ]; then
    envsubst < /templates/wdqs-frontend-config.json.template > /config/wdqs-frontend-config.json
fi

# Use config from /config
cp /config/wdqs-frontend-config.json /usr/share/nginx/html/custom-config.json

envsubst < /templates/nginx-default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
