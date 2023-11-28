#!/usr/bin/env bash
# shellcheck disable=SC1091

# ==== Load the Wikibase default env vars and create a new LocalSettings file 
# the entrypoint logic is always depending on LocalSettings.php to be there
# since it's now mounted per default it gets removed when the container changes.
# copy the one from the pipeline and run envsubst in this shell
TMP_LOCALSETTINGS="./suites/upgrade/tmp_LocalSettings.php"
rm -r $TMP_LOCALSETTINGS 2>/dev/null
npx envsub "../build/Wikibase/$MEDIAWIKI_SETTINGS_TEMPLATE_FILE" "$TMP_LOCALSETTINGS"

# === Modify old LocalSettings.php
# This section is needed to create the 1.39 releases
# TODO: remove this once we are no longer upgrading from 1.38 releases
# Replace LocalSettings.php lines that need to be changed for the upgrade
# shellcheck disable=SC2016
sed -i '/require_once "\${DOLLAR}IP\/extensions\/Wikibase\/client\/WikibaseClient.php";/c\wfLoadExtension( "WikibaseClient", "${DOLLAR}IP\/extensions\/Wikibase\/extension-client.json" );' $TMP_LOCALSETTINGS
# shellcheck disable=SC2016
sed -i '/require_once "\${DOLLAR}IP\/extensions\/Wikibase\/repo\/WikibaseRepo.php";/c\wfLoadExtension( "WikibaseRepo", "${DOLLAR}IP\/extensions\/Wikibase\/extension-repo.json" );' $TMP_LOCALSETTINGS
