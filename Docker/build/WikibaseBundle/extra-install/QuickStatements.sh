#!/bin/bash
set -ex

php /var/www/html/extensions/OAuth/maintenance/createOAuthConsumer.php \
    --approve \
    --callbackUrl  "$QS_PUBLIC_SCHEME_HOST_AND_PORT/api.php" \
    --callbackIsPrefix true --user "$MW_ADMIN_NAME" --name QuickStatements --description QuickStatements --version 1.0.1 \
    --grants createeditmovepage --grants editpage --grants highvolume --jsonOnSuccess > /quickstatements/data/qs-oauth.json

if [[ -f /quickstatements/data/qs-oauth.json ]]; then
    OAUTH_CONSUMER_KEY=$(grep -o '"key":"[^"]*' /quickstatements/data/qs-oauth.json | grep -o '[^"]*$')
    OAUTH_CONSUMER_SECRET=$(grep -o '"secret":"[^"]*' /quickstatements/data/qs-oauth.json | grep -o '[^"]*$')
	
    export OAUTH_CONSUMER_KEY
    export OAUTH_CONSUMER_SECRET

    envsubst < /templates/oauth.ini > /quickstatements/data/oauth.ini
fi
