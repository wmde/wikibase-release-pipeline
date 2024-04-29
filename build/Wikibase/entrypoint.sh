#!/usr/bin/env bash

# This file is provided by the wikibase/wikibase docker image.

# Test if required environment variables have been set
REQUIRED_VARIABLES=(SETUP_MW_ADMIN_NAME SETUP_MW_ADMIN_PASS SETUP_MW_ADMIN_EMAIL SETUP_DB_SERVER SETUP_DB_USER SETUP_DB_PASS SETUP_DB_NAME SETUP_MW_WG_SERVER)
for i in "${REQUIRED_VARIABLES[@]}"; do
    eval THISSHOULDBESET=\$"$i"
    if [ -z "$THISSHOULDBESET" ]; then
    echo "$i is required but isn't set. You should pass it to docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file";
    exit 1;
    fi
done

set -eu

# Wait for the db to come up. Sometimes it appears to come up and then
# goes back down meaning MW install fails, so wait for a second and double check:
/wait-for-it.sh "$SETUP_DB_SERVER" -t 300
sleep 1
/wait-for-it.sh "$SETUP_DB_SERVER" -t 300

if [ ! -d "/config" ]; then
    echo "A volume mapped to /config is required. See: https://docs.docker.com/storage/volumes/"
    exit 1
fi

# Sync LocalSettings.php, prefer /config/LocalSettings.php if it exists
if [ -e "/config/LocalSettings.php" ]; then
    cp /config/LocalSettings.php /var/www/html/LocalSettings.php
elif [ -e "/var/www/html/LocalSettings.php" ]; then
    echo "LocalSettings.php not found in /config, running MediaWiki install."
    # Run MediaWiki install script
    php /var/www/html/maintenance/run.php install \
        --dbuser "$SETUP_DB_USER" \
        --dbpass "$SETUP_DB_PASS" \
        --dbname "$SETUP_DB_NAME" \
        --dbserver "$SETUP_DB_SERVER" \
        --server "$SETUP_MW_WG_SERVER" \
        --pass "$SETUP_MW_ADMIN_PASS" \
        --lang "$MW_WG_LANGUAGE_CODE" \
        "$MW_WG_SITENAME" \
        "$SETUP_MW_ADMIN_NAME"

    # Add WBS customizations to generated LocalSettings.php
    echo 'include "/var/www/html/LocalSettings.wikibase.php";' >> /var/www/html/LocalSettings.php
    # Replace /config/LocalSettings.php with newly generated LocalSettings.php
    cp /var/www/html/LocalSettings.php /config/LocalSettings.php
    # Update the MW Admin email address (if this admin user doesn't already exist, a new one will be created)
    php /var/www/html/maintenance/run.php resetUserEmail --no-reset-password "$SETUP_MW_ADMIN_NAME" "$SETUP_MW_ADMIN_EMAIL"
    # Update Admin password
    php /var/www/html/maintenance/run.php changePassword.php --user="$SETUP_MW_ADMIN_NAME" --password="$SETUP_MW_ADMIN_PASS"
fi

# Always run update
php /var/www/html/maintenance/run.php update --quick

if [ -f /default-extra-install.sh ]; then
    # shellcheck disable=SC1091
    bash /default-extra-install.sh
fi

if [ -f /extra-install.sh ]; then
    # shellcheck disable=SC1091
    bash /extra-install.sh
fi

# Run the actual entry point
docker-php-entrypoint apache2-foreground
