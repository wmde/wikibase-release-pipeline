#!/bin/bash

export DOLLAR='$'
envsubst < /var/www/html/LocalSettings.template.d/LocalSettings.Elasticsearch.php.template > /var/www/html/LocalSettings.d/Elasticsearch.php
