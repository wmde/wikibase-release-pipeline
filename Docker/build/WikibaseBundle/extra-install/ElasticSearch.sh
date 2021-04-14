#!/bin/bash
set -ex

if [ -z "$MW_ELASTIC_HOST" ] || \
[ -z "$MW_ELASTIC_PORT" ] ; then
    echo "Skipping Elasticsearch setup ..."
    exit 0
else
    /wait-for-it.sh "$MW_ELASTIC_HOST:$MW_ELASTIC_PORT" -t 300
    php /var/www/html/extensions/CirrusSearch/maintenance/UpdateSearchIndexConfig.php
    php /var/www/html/extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipParse
    php /var/www/html/extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipLinks --indexOnSkip
fi