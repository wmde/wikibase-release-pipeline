#!/bin/bash
set -ex

export DOLLAR='$'
envsubst < /var/www/html/LocalSettings.template.d/LocalSettings.Elasticsearch.php.template > /var/www/html/LocalSettings.d/Elasticsearch.php

if [ -z "$MW_ELASTIC_PORT" ] || \
[ -z "$MW_ELASTIC_PORT" ] ; then
    echo "Skipping Elasticsearch setup ..."
    exit 0
else
    php /var/www/html/extensions/CirrusSearch/maintenance/UpdateSearchIndexConfig.php
    php /var/www/html/extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipParse
    php /var/www/html/extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipLinks --indexOnSkip
fi

