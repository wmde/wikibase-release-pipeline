#!/usr/bin/env bash
# shellcheck disable=SC1091,SC1090,SC2086
set -e

cd test

ENV_VERSION=$1
TO_VERSION=$2

if [ -z "$TO_VERSION" ]; then
    echo "TO_VERSION is not set"
    exit 1
fi

if [ ! -f "../$TO_VERSION" ]; then
    echo "TO_VERSION does not exist"
    exit 1
fi

# Why is this neccessary locally, but not in CI?
set -o allexport; source ../variables.env set +o allexport;

WIKIBASE_TEST_CONTAINER=test-wikibase-1
DEFAULT_SUITE_CONFIG="-f docker-compose.upgrade.yml"

# log directory setup
export LOG_DIR="log/$SUITE"
export TEST_LOG="$LOG_DIR/$SUITE.log"

rm -f "$TEST_LOG" || true
rm -rf "$LOG_DIR/wikibase"
mkdir -p "$LOG_DIR/wikibase"
rm -rf "$LOG_DIR/client"
mkdir -p "$LOG_DIR/client"

# It surprises me that we load both the old version's and new version's ENV VARS here,
# I'd expect we'd load only the default.env + {old-version}.env at this stage.
set -o allexport; source upgrade/default_variables.env; source "upgrade/old-versions/$ENV_VERSION.env"; source "../$TO_VERSION" set +o allexport

# old wikibase version
export WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_SOURCE_IMAGE_NAME"
export SUITE_CONFIG="$DEFAULT_SUITE_CONFIG"

# If WDQS is specified append that yml file to SUITE_CONFIG
if [ -n "$WDQS_SOURCE_IMAGE_NAME" ]; then
    export WDQS_TEST_IMAGE_NAME="$WDQS_SOURCE_IMAGE_NAME"
    export SUITE_CONFIG="${DEFAULT_SUITE_CONFIG} -f docker-compose.upgrade.wdqs.yml"
    export RUN_QUERYSERVICE_POST_UPGRADE_TEST="true"
fi

SUITE_COMPOSE="docker compose $SUITE_CONFIG"
SUITE_AND_TEST_SETUP_COMPOSE="$SUITE_COMPOSE -f docker-compose.test-setup.yml"
SUITE_AND_TEST_RUNNER_COMPOSE="$SUITE_COMPOSE -f docker-compose-selenium-test.yml"

function remove_services_and_volumes {
    $SUITE_AND_TEST_RUNNER_COMPOSE down --volumes --remove-orphans --timeout 1 >> "$TEST_LOG" 2>&1 || true
}

# build test-setup and wikibase-selenium-test just in case anything has changed
$SUITE_AND_TEST_SETUP_COMPOSE build test-setup >> $TEST_LOG 2>&1
$SUITE_AND_TEST_RUNNER_COMPOSE build wikibase-selenium-test >> "$TEST_LOG" 2>&1

# =============================================================================
# =============================== pre_upgrade =================================
# =============================================================================

SUITE=pre_upgrade

echo "" 2>&1 | tee -a "$TEST_LOG"
echo "▶️  Setting-up \"$SUITE\" test suite ($ENV_VERSION)"  2>&1 | tee -a "$TEST_LOG"
echo "" 2>&1 | tee -a "$TEST_LOG"

# shut down the stack if running, remove volumes to start test suite on fresh db
echo "🔄 Removing existing Docker test services and volumes" 
remove_services_and_volumes

# start the old version & write logs
echo "🔄 Creating Docker test services and volumes on ${ENV_VERSION}" 2>&1 | tee -a "$TEST_LOG"
$SUITE_COMPOSE up -d >> "$TEST_LOG" 2>&1
$SUITE_COMPOSE logs -f --no-color >> "$TEST_LOG" &

# wait until containers start
$SUITE_AND_TEST_SETUP_COMPOSE run --rm test-setup

echo -e "\n✳️  Running \"$SUITE\" test suite ($ENV_VERSION)"  2>&1 | tee -a "$TEST_LOG"

$SUITE_AND_TEST_RUNNER_COMPOSE run --rm wikibase-selenium-test bash -c "npm run test:run --silent"

# =============================================================================
# ================================= upgrade ===================================
# ============================================================================= 

echo "" 2>&1 | tee -a "$TEST_LOG"
echo "✳️  Performing upgrade steps for \"${TO_VERSION}\""  2>&1 | tee -a "$TEST_LOG"
echo "" 2>&1 | tee -a "$TEST_LOG"

# the entrypoint logic is always depending on LocalSettings.php to be there
# since it's now mounted per default it gets removed when the container changes.
# copy the one from the pipeline and run envsubst in this shell
TMP_DIR="$(mktemp -d)"
TMP_LOCALSETTINGS="$TMP_DIR/LocalSettings.php"

# Source the default env vars used for building and create a new LocalSettings file 
set -o allexport; source ../Docker/build/Wikibase/default.env; set +o allexport
envsubst < "../Docker/build/Wikibase/$MEDIAWIKI_SETTINGS_TEMPLATE_FILE" > "$TMP_LOCALSETTINGS"
export TMP_LOCALSETTINGS

# MODIFY OLD LocalSettings.php as part of upgrading
# This section is needed to create the 1.39 releases
# TODO remove this once we are no longer upgrading from 1.38 releases
# Replace LocalSettings.php lines that need to be changed for the upgrade
# shellcheck disable=SC2016
sed -i '/require_once "\${DOLLAR}IP\/extensions\/Wikibase\/client\/WikibaseClient.php";/c\wfLoadExtension( "WikibaseClient", "${DOLLAR}IP\/extensions\/Wikibase\/extension-client.json" );' $TMP_LOCALSETTINGS
# shellcheck disable=SC2016
sed -i '/require_once "\${DOLLAR}IP\/extensions\/Wikibase\/repo\/WikibaseRepo.php";/c\wfLoadExtension( "WikibaseRepo", "${DOLLAR}IP\/extensions\/Wikibase\/extension-repo.json" );' $TMP_LOCALSETTINGS

# docker compose down (keeping volumes) to simulate upgrade
echo "🔄 Removing Docker services for ${ENV_VERSION}, but keeping volumes"  2>&1 | tee -a "$TEST_LOG"
$SUITE_COMPOSE down >> $TEST_LOG 2>&1

# allow overriding target
if [ -z "$TARGET_WIKIBASE_UPGRADE_IMAGE_NAME" ]; then
    export TARGET_WIKIBASE_UPGRADE_IMAGE_NAME="$WIKIBASE_IMAGE_NAME"
fi

export WIKIBASE_TEST_IMAGE_NAME="$TARGET_WIKIBASE_UPGRADE_IMAGE_NAME:latest";
# echo "ℹ️  Target WIKIBASE_TEST_IMAGE_NAME is set to $WIKIBASE_TEST_IMAGE_NAME"

if [ -n "$WDQS_SOURCE_IMAGE_NAME" ]; then
    export WDQS_TEST_IMAGE_NAME="$WDQS_IMAGE_NAME:latest";
    docker load -i "../artifacts/$WDQS_IMAGE_NAME.docker.tar.gz"
fi

# =============================================================================
# =============================== post_upgrade ================================
# =============================================================================

SUITE=post_upgrade

LOG_DIR="log/$SUITE"
TEST_LOG="$LOG_DIR/$SUITE.log"

mkdir -p "$LOG_DIR"
rm -f "$TEST_LOG" || true

echo "" 2>&1 | tee -a "$TEST_LOG"
echo "▶️  Setting-up \"$SUITE\" test suite" 2>&1 | tee -a "$TEST_LOG"
echo "" 2>&1 | tee -a "$TEST_LOG"

# load new version and start it 
echo "🔄 Creating Docker test services and volumes for \"${TO_VERSION}\"" 2>&1 | tee -a "$TEST_LOG"
docker load -i "../artifacts/$TARGET_WIKIBASE_UPGRADE_IMAGE_NAME.docker.tar.gz" >> $TEST_LOG 2>&1
$SUITE_COMPOSE -f upgrade/docker-compose.override.yml up -d >> $TEST_LOG 2>&1
$SUITE_COMPOSE logs -f --no-color >> "$TEST_LOG" &

# wait until containers start
$SUITE_AND_TEST_SETUP_COMPOSE run --rm test-setup

# run update.php and log to separate file
echo -e "ℹ️  Running \"php /var/www/html/maintenance/update.php\" on \"${TO_VERSION}\""  2>&1 | tee -a "$TEST_LOG"

docker exec "$WIKIBASE_TEST_CONTAINER" php /var/www/html/maintenance/update.php --quick > "$TEST_LOG"

echo -e "\n✳️  Running \"$SUITE\" test suite (\"${TO_VERSION}\")" 2>&1 | tee -a "$TEST_LOG"

$SUITE_AND_TEST_RUNNER_COMPOSE run --rm wikibase-selenium-test bash -c "npm run test:run --silent"

# shut down the stack, also remove volumes to test data does not interfere with next test runs
echo -e "🔄 Removing running Docker test services and volumes\n"  2>&1 | tee -a "$TEST_LOG"
remove_services_and_volumes
