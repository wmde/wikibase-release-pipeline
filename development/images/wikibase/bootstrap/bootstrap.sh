#!/usr/bin/env bash

# WBS-owned install/update lifecycle. Keep this separate from application
# startup so externally managed deployments can use the packaged application
# without a persistent /config volume.

# Exit immediately with message if no /config volume is available
if [ ! -d "/config" ]; then
    echo "A volume mapped to /config is required for WBS configuration."
    exit 1
fi

# The callback is opt-in. Treat an omitted or empty value as disabled so this
# optional WBS service does not prevent an otherwise valid image from starting.
export METADATA_CALLBACK="${METADATA_CALLBACK:-false}"

# Exit immediately on errors or unset variables from here onwards
set -eu

bash /callback.sh || true

# Take wikibase-php.ini from user config if present
if [ -e "/config/wikibase-php.ini" ]; then
    cp /config/wikibase-php.ini /usr/local/etc/php/conf.d/wikibase-php.ini

# Otherwise, make our stock wikibase-php.ini visible to the user for customization
else
    cp /usr/local/etc/php/conf.d/wikibase-php.ini /config/wikibase-php.ini
fi

instance_settings=/config/InstanceSettings.php
custom_settings=/config/LocalSettings.php
image_state_directory=/config/.wikibase-image
migration_state=$image_state_directory/config-migration
staged_instance=$migration_state/InstanceSettings.php
staged_custom=$migration_state/LocalSettings.php
installation_state=$image_state_directory/installation-state

ensure_image_state_directory() {
    mkdir -p "$image_state_directory"
}

remove_image_state_directory_if_empty() {
    rmdir "$image_state_directory" 2> /dev/null || true
}

set_installation_phase() {
    next_phase=$1
    ensure_image_state_directory
    printf '%s\n' "$next_phase" > "$installation_state.tmp"
    mv "$installation_state.tmp" "$installation_state"
}

complete_fresh_installation() {
    current_phase=$(cat "$installation_state")

    if [ "$current_phase" = configured ]; then
        php /var/www/html/maintenance/run.php installPreConfigured
        set_installation_phase database-installed
        current_phase=database-installed
    fi
    if [ "$current_phase" = database-installed ]; then
        # installPreConfigured creates the core and extension tables, but a
        # normal update is still needed for extensions using a virtual domain.
        php /var/www/html/maintenance/run.php update --quick
        set_installation_phase database-updated
        current_phase=database-updated
    fi
    if [ "$current_phase" = database-updated ]; then
        php /var/www/html/maintenance/run.php createAndPromote \
            --force \
            --sysop \
            --bureaucrat \
            --interface-admin \
            --email "$MW_ADMIN_EMAIL" \
            "$MW_ADMIN_NAME" \
            "$MW_ADMIN_PASS"
        set_installation_phase administrator-created
        current_phase=administrator-created
    fi
    if [ "$current_phase" = administrator-created ]; then
        if [ -f /default-extra-install.sh ]; then
            bash /default-extra-install.sh
        fi

        if [ -f /extra-install.sh ]; then
            bash /extra-install.sh
        fi
        rm -f "$installation_state"
        remove_image_state_directory_if_empty
        return
    fi
    echo "Unknown WBS installation phase: $current_phase"
    exit 1
}

install_migrated_configuration() {
    if [ ! -r "$staged_instance" ] || [ ! -r "$staged_custom" ]; then
        echo "The staged WBS 8 configuration migration is incomplete."
        exit 1
    fi
    php /opt/wbs/bootstrap/suite-7-configuration/migrate.php install \
        "$staged_instance" \
        "$instance_settings"
    php /opt/wbs/bootstrap/suite-7-configuration/migrate.php install \
        "$staged_custom" \
        "$custom_settings"
}

migrate_legacy_configuration() {
    legacy_settings=$custom_settings
    backup_directory=/config/backups
    actual_configuration=/tmp/LocalSettings.actual.json
    reference_configuration=/tmp/LocalSettings.reference.json
    temporary_instance=$migration_state/InstanceSettings.php.tmp
    legacy_prefix=/tmp/LocalSettings.legacy-prefix.php

    echo "Legacy LocalSettings.php found; preserving and migrating it."
    ensure_image_state_directory
    mkdir -p "$backup_directory" "$migration_state"
    if [ ! -e "$backup_directory/LocalSettings.pre-wbs-8.php.backup" ]; then
        cp "$legacy_settings" "$backup_directory/LocalSettings.pre-wbs-8.php.backup"
    fi
    legacy_shape=$(php /opt/wbs/bootstrap/suite-7-configuration/migrate.php legacy-prefix \
        "$legacy_settings" \
        "$legacy_prefix")
    echo "Recognized $legacy_shape generated configuration."
    php /var/www/html/maintenance/run.php getConfiguration \
        --conf "$legacy_prefix" \
        --format=json \
        --json-partial-output-on-error > "$actual_configuration"
    php /opt/wbs/bootstrap/suite-7-configuration/migrate.php prepare \
        "$legacy_settings" \
        "$actual_configuration" \
        "$temporary_instance"
    php /var/www/html/maintenance/run.php getConfiguration \
        --conf /opt/wbs/bootstrap/suite-7-configuration/ReferenceConfig.php \
        --format=json \
        --json-partial-output-on-error > "$reference_configuration"
    php /opt/wbs/bootstrap/suite-7-configuration/migrate.php finish \
        "$legacy_settings" \
        "$actual_configuration" \
        "$reference_configuration" \
        "$staged_custom" \
        "$temporary_instance" \
        "$staged_instance"
    rm -f "$actual_configuration" "$reference_configuration" "$legacy_prefix"
    install_migrated_configuration
    echo "Legacy configuration saved in $backup_directory."
}

if [ -d "$migration_state" ]; then
    ensure_image_state_directory
    if [ ! -r "$staged_instance" ] || [ ! -r "$staged_custom" ]; then
        if ! grep -q '^# End of generated LocalSettings.php$' "$custom_settings"; then
            echo "The interrupted WBS 8 configuration migration cannot be resumed."
            exit 1
        fi
        migrate_legacy_configuration
    else
        echo "Resuming the WBS 8 configuration migration."
        install_migrated_configuration
    fi
    php /var/www/html/maintenance/run.php update --quick
    rm -rf "$migration_state"
    remove_image_state_directory_if_empty
elif [ -e "$installation_state" ]; then
    ensure_image_state_directory
    if [ "$(cat "$installation_state")" = preparing ]; then
        if [ ! -r "$instance_settings" ] || [ ! -r "$custom_settings" ]; then
            php /opt/wbs/bootstrap/configuration.php fresh "$instance_settings" "$custom_settings"
        fi
        set_installation_phase configured
    fi
    echo "Resuming WBS installation at phase $(cat "$installation_state")."
    complete_fresh_installation
elif [ -e "$instance_settings" ]; then
    # These values are inputs to initial setup. Existing configuration is authoritative.
    unset \
        DB_SERVER DB_PASS DB_USER DB_NAME \
        MW_ADMIN_NAME MW_ADMIN_EMAIL MW_ADMIN_PASS \
        MW_WG_SERVER MW_WG_LANGUAGE_CODE MW_WG_SITENAME \
        ELASTICSEARCH_HOST
    php /var/www/html/maintenance/run.php update --quick
elif [ -e "$custom_settings" ]; then
    if ! grep -q '^# End of generated LocalSettings.php$' "$custom_settings"; then
        echo "$custom_settings exists without $instance_settings and is not a recognized Wikibase Suite 7 configuration."
        exit 1
    fi
    migrate_legacy_configuration
    php /var/www/html/maintenance/run.php update --quick
    rm -rf "$migration_state"
    remove_image_state_directory_if_empty
else
    echo "No instance configuration found; installing MediaWiki from the image-owned configuration."

    # Check for required environment variables
    set +u
    required_vars=(
        DB_SERVER
        DB_PASS
        DB_USER
        DB_NAME
        MW_ADMIN_NAME
        MW_ADMIN_EMAIL
        MW_ADMIN_PASS
        MW_WG_SERVER
        MW_WG_LANGUAGE_CODE
        MW_WG_SITENAME
    )
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "$var is required but isn't set. You should pass it to Docker. See: https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env-file"
            exit 1
        fi
    done
    set -u

    set_installation_phase preparing
    php /opt/wbs/bootstrap/configuration.php fresh "$instance_settings" "$custom_settings"
    set_installation_phase configured
    complete_fresh_installation
fi
