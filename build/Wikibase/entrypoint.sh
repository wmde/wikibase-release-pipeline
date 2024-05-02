#!/usr/bin/env bash

# This file is provided by the wikibase/wikibase docker image.

# Exit immediately with message if no /config volume is available
if [ ! -d "/config" ]; then
    echo "A volume mapped to /config is required."
    exit 1
fi

# Exit immediate on errors or unset variables from here onwards
set -eu

if [ -e "/config/LocalSettings.php" ]; then
    cp /config/LocalSettings.php /var/www/html/LocalSettings.php
    # Always run update (this might be the first run off of a new image version on existing config and data)
    php /var/www/html/maintenance/run.php update --quick
else
    echo "/config/LocalSettings.php not found, running MediaWiki install."

    # Check for required SETUP_ env vars
    set +u
    required_vars=(
        SETUP_DB_SERVER
        SETUP_DB_USER
        SETUP_DB_PASS
        SETUP_DB_NAME
        SETUP_MW_ADMIN_NAME
        SETUP_MW_ADMIN_PASS
        SETUP_MW_ADMIN_EMAIL
        MW_WG_SERVER
        MW_WG_SITENAME
        MW_WG_LANGUAGE_CODE
    )
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "$var is required but isn't set. You should pass it to Docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file"
            exit 1
        fi
    done
    set -u

    # Run MediaWiki install script, and update values
    php /var/www/html/maintenance/run.php install \
        --server "$MW_WG_SERVER" \
        --scriptpath "/w" \
        --dbuser "$SETUP_DB_USER" \
        --dbpass "$SETUP_DB_PASS" \
        --dbname "$SETUP_DB_NAME" \
        --dbserver "$SETUP_DB_SERVER" \
        --pass "$SETUP_MW_ADMIN_PASS" \
        --lang "$MW_WG_LANGUAGE_CODE" \
        "$MW_WG_SITENAME" \
        "$SETUP_MW_ADMIN_NAME"

    # Include WBS customizations to generated LocalSettings.php
    {
        echo '# Insert any custom settings which should be ran BEFORE extensions here'
        echo
        echo 'include "/var/www/html/LocalSettings.wbs-extensions.php";'
        echo
        echo '# Insert any custom settings which should be ran AFTER extensions here'
    } >> /var/www/html/LocalSettings.php

    # Replace /config/LocalSettings.php with newly generated LocalSettings.php
    cp /var/www/html/LocalSettings.php /config/LocalSettings.php
    # Update the MW Admin email address (if this admin user doesn't already exist, a new one will be created)
    php /var/www/html/maintenance/run.php resetUserEmail --no-reset-password "$SETUP_MW_ADMIN_NAME" "$SETUP_MW_ADMIN_EMAIL"

    php /var/www/html/maintenance/run.php update --quick
    
    if [ -f /default-extra-install.sh ]; then
        # shellcheck disable=SC1091
        bash /default-extra-install.sh
    fi

    if [ -f /extra-install.sh ]; then
        # shellcheck disable=SC1091
        bash /extra-install.sh
    fi
fi

# Run the actual entry point
docker-php-entrypoint apache2-foreground
