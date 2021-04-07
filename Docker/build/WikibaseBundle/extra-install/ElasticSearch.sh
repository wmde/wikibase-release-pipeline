#!/bin/bash
set -ex

export DOLLAR='$'
envsubst < /var/www/html/LocalSettings.template.d/LocalSettings.Elasticsearch.php.template > /var/www/html/LocalSettings.d/Elasticsearch.php

php /var/www/html/extensions/CirrusSearch/maintenance/UpdateSearchIndexConfig.php
php /var/www/html/extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipParse
php /var/www/html/extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipLinks --indexOnSkip
