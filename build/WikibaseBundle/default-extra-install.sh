#!/usr/bin/env bash
set -x

# Enables and configures elasticsearch index
if [ -z "$MW_ELASTIC_HOST" ] || [ -z "$MW_ELASTIC_PORT" ] ; then
    echo "Skipping Elasticsearch setup ..."
else
    /wait-for-it.sh "$MW_ELASTIC_HOST:$MW_ELASTIC_PORT" -t 300
    php /var/www/html/extensions/CirrusSearch/maintenance/UpdateSearchIndexConfig.php
    php /var/www/html/extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipParse
    php /var/www/html/extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipLinks --indexOnSkip
fi


# Creates an OAuth consumer for quickstatements
if [ -z "$QS_PUBLIC_SCHEME_HOST_AND_PORT" ] ; then
    echo "Skipping QuickStatements setup ..."
else
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
fi
