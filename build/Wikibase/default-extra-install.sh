#!/usr/bin/env bash

set -ex

# Enables and configures elasticsearch index
if [ -z "${ELASTICSEARCH_HOST:-}" ] ; then
    echo "Skipping Elasticsearch setup ..."
else
    # shellcheck disable=2153 # do not warn about unused variables
    php /var/www/html/extensions/CirrusSearch/maintenance/UpdateSearchIndexConfig.php
    php /var/www/html/extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipParse
    php /var/www/html/extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipLinks --indexOnSkip
fi

# Creates an OAuth consumer for quickstatements
if [ -z "${QUICKSTATEMENTS_PUBLIC_URL:-}" ] ; then
    echo "Skipping QuickStatements setup ..."
else
    # Attempt to create OAuth consumer for QuickStatements
    if php /var/www/html/extensions/OAuth/maintenance/createOAuthConsumer.php \
        --approve \
        --callbackUrl  "$QUICKSTATEMENTS_PUBLIC_URL/api.php" \
        --callbackIsPrefix true --user "$MW_ADMIN_NAME" --name QuickStatements --description QuickStatements --version 1.0.1 \
        --grants createeditmovepage --grants editpage --grants highvolume --jsonOnSuccess > /quickstatements/data/qs-oauth.json; then
        # Check if JSON file was created
        if [[ -f /quickstatements/data/qs-oauth.json ]]; then
            OAUTH_CONSUMER_KEY=$(grep -o '"key":"[^"]*' /quickstatements/data/qs-oauth.json | grep -o '[^"]*$')
            OAUTH_CONSUMER_SECRET=$(grep -o '"secret":"[^"]*' /quickstatements/data/qs-oauth.json | grep -o '[^"]*$')

            export OAUTH_CONSUMER_KEY
            export OAUTH_CONSUMER_SECRET

            envsubst < /templates/oauth.ini > /quickstatements/data/oauth.ini
        fi
    fi
fi
