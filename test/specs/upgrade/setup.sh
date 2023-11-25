#!/usr/bin/env bash
# shellcheck disable=SC1091

# ==== Load the Wikibase default env vars and create a new LocalSettings file 
# the entrypoint logic is always depending on LocalSettings.php to be there
# since it's now mounted per default it gets removed when the container changes.
# copy the one from the pipeline and run envsubst in this shell
TMP_LOCALSETTINGS="./suites/upgrade/tmp_LocalSettings.php"
set -o allexport; source ../Docker/build/Wikibase/default.env; set +o allexport
# envsubst < "../Docker/build/Wikibase/$MEDIAWIKI_SETTINGS_TEMPLATE_FILE" > "$TMP_LOCALSETTINGS"
npx envsub "../Docker/build/Wikibase/$MEDIAWIKI_SETTINGS_TEMPLATE_FILE" "$TMP_LOCALSETTINGS"

# === MODIFY OLD LocalSettings.php
# This section is needed to create the 1.39 releases
# TODO: remove this once we are no longer upgrading from 1.38 releases
# Replace LocalSettings.php lines that need to be changed for the upgrade
# shellcheck disable=SC2016
sed -i '/require_once "\${DOLLAR}IP\/extensions\/Wikibase\/client\/WikibaseClient.php";/c\wfLoadExtension( "WikibaseClient", "${DOLLAR}IP\/extensions\/Wikibase\/extension-client.json" );' $TMP_LOCALSETTINGS
# shellcheck disable=SC2016
sed -i '/require_once "\${DOLLAR}IP\/extensions\/Wikibase\/repo\/WikibaseRepo.php";/c\wfLoadExtension( "WikibaseRepo", "${DOLLAR}IP\/extensions\/Wikibase\/extension-repo.json" );' $TMP_LOCALSETTINGS

# === Take down Wikibase without removing data
# resettting tmp_LocalSettings.php path to root accoridng to host docker
export TMP_LOCALSETTINGS="./upgrade/tmp_LocalSettings.php"
# TODO: consider moving these into specs/upgrade/upgrade.ts#before as testSetup calls
$TEST_COMPOSE --progress quiet down
# add override file which volume mounts the newly create tmp_LocalSettings.php
$TEST_COMPOSE -f suites/upgrade/docker-compose.override.yml --progress quiet up -d
