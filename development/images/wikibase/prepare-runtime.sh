#!/usr/bin/env bash

set -eu

workload="${1:-web}"

# MediaWiki natively loads MW_CONFIG_FILE as its complete configuration entry
# point. When set, it bypasses all WBS bootstrapping in this image, including
# installation, persistence, metadata registration, and database updates.
if [ -n "${MW_CONFIG_FILE:-}" ]; then
    exit 0
fi

if [ "$workload" = "web" ]; then
    /wbs-bootstrap.sh
    exit 0
fi

if [ ! -r /config/LocalSettings.php ]; then
    echo "/config/LocalSettings.php is required for the $workload workload."
    exit 1
fi
cp /config/LocalSettings.php /var/www/html/LocalSettings.php
