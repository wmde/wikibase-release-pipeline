#!/usr/bin/env bash
# This file is provided by the wikibase/wikibase docker image.

# Test if required environment variables have been set
REQUIRED_VARIABLES=(MW_ADMIN_NAME MW_ADMIN_PASS MW_ADMIN_EMAIL MW_WG_SECRET_KEY DB_SERVER DB_USER DB_PASS DB_NAME)
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
/wait-for-it.sh "$DB_SERVER" -t 300
sleep 1
/wait-for-it.sh "$DB_SERVER" -t 300

# Run MediaWiki install script
rm -f /var/www/html/LocalSettings.php
rm -f /var/www/html/LocalSettings.generated/LocalSettings.php
mkdir -p /var/www/html/LocalSettings.generated
php /var/www/html/maintenance/run.php install \
    --confpath /var/www/html/LocalSettings.generated \
    --dbuser "$DB_USER" \
    --dbpass "$DB_PASS" \
    --dbname "$DB_NAME" \
    --dbserver "$DB_SERVER" \
    --lang "$MW_SITE_LANG" \
    --pass "$MW_ADMIN_PASS" \
    "$MW_SITE_NAME" \
    "$MW_ADMIN_NAME"

mv -f /var/www/html/LocalSettings.generated/LocalSettings.php /var/www/html/LocalSettings.generated.php
rm -rf /var/www/html/LocalSettings.generated
mv -f /var/www/html/LocalSettings.root.php /var/www/html/LocalSettings.php 2>/dev/null; true

# Update Admin User name ane email
php /var/www/html/maintenance/run.php resetUserEmail --no-reset-password "$MW_ADMIN_NAME" "$MW_ADMIN_EMAIL"

# Run update.php to finish Wikibase install or upgrade
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
