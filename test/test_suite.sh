#!/usr/bin/env bash
set -e

cd test

export SUITE=$1

echo ""
echo "▶️  Setting-up \"$SUITE\" test suite"
echo ""

if [ -z "$SUITE" ]; then
    echo "🚨 SUITE is not set"
    exit 1
fi

# setup log directory, create "last-ran" file and setup log
rm -Rf "log/$SUITE"
mkdir -p "log/$SUITE/wikibase"
touch "log/$SUITE/last-ran-$(date +%Y-%d-%m_%H-%M%Z)"
export SETUP_LOG="log/$SUITE/setup.log"

if [ -z "$DATABASE_IMAGE_NAME" ]; then
    export DATABASE_IMAGE_NAME="$DEFAULT_DATABASE_IMAGE_NAME"
fi

# select image based on prepended suite name
if [[ $SUITE == base__* ]]; then
    WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_IMAGE_NAME"
else
    WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_BUNDLE_IMAGE_NAME"

    # load additional bundle images
    {
        docker load -i "../artifacts/$ELASTICSEARCH_IMAGE_NAME.docker.tar.gz" >> "$SETUP_LOG" 2>&1
        docker load -i "../artifacts/$QUICKSTATEMENTS_IMAGE_NAME.docker.tar.gz" >> "$SETUP_LOG" 2>&1
    } >> "$SETUP_LOG" 2>&1
fi

export WIKIBASE_TEST_IMAGE_NAME

# load default images
{
    docker load -i "../artifacts/$WIKIBASE_TEST_IMAGE_NAME.docker.tar.gz"
    docker load -i "../artifacts/$WDQS_IMAGE_NAME.docker.tar.gz"
    docker load -i "../artifacts/$WDQS_FRONTEND_IMAGE_NAME.docker.tar.gz"
    docker load -i "../artifacts/$WDQS_PROXY_IMAGE_NAME.docker.tar.gz"
} >> "$SETUP_LOG" 2>&1

echo "ℹ️  $(docker --version)"

export WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_TEST_IMAGE_NAME:latest"
export QUERYSERVICE_IMAGE_NAME="$QUERYSERVICE_IMAGE_NAME:latest"
export QUERYSERVICE_UI_IMAGE_NAME="$QUERYSERVICE_UI_IMAGE_NAME:latest"
export WDQS_PROXY_IMAGE_NAME="$WDQS_PROXY_IMAGE_NAME:latest"
export QUICKSTATEMENTS_IMAGE_NAME="$QUICKSTATEMENTS_IMAGE_NAME:latest"
export ELASTICSEARCH_IMAGE_NAME="$ELASTICSEARCH_IMAGE_NAME:latest"

export DEFAULT_SUITE_CONFIG="--env-file default.env -f docker-compose.yml"

bash run_selenium.sh "$1"