#!/usr/bin/env bash
set -e
set -x

cd test

export SUITE=$1

if [ -z "$SUITE" ]; then
    echo "🚨 SUITE is not set"
    exit 1
fi

# log directory setup
export RESULTS_DIR="suites/$SUITE/results"
export TEST_LOG="$RESULTS_DIR/$SUITE.log"
docker compose run --rm test-runner -c "rm -rf \"$RESULTS_DIR\"" > /dev/null 2>&1
mkdir -p "$RESULTS_DIR"

# Load image if it's not already loaded
load_image() { 
    local image="$1"
    
    # Check if the image exists
    {
        if docker images -q "$image" 2>/dev/null | grep -q .; then
            echo "ℹ️  Image $image already loaded."
        else
            echo "🔄 Loading image: $image"
            docker load -i "../artifacts/$image.docker.tar.gz"
        fi
    } >> "$TEST_LOG" 2>&1
}

echo -e "\n▶️  Setting-up \"$SUITE\" test suite" 2>&1 | tee -a "$TEST_LOG"

if [ -z "$DATABASE_IMAGE_NAME" ]; then
    export DATABASE_IMAGE_NAME="$MARIADB_IMAGE"
fi

# select image based on prepended suite name
if [[ $SUITE == base__* ]]; then
    WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_IMAGE_NAME"
else
    WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_BUNDLE_IMAGE_NAME"
fi
export WIKIBASE_TEST_IMAGE_NAME

default_images=(
    "$WIKIBASE_TEST_IMAGE_NAME"
    "$WDQS_IMAGE_NAME"
    "$WDQS_FRONTEND_IMAGE_NAME"
    "$WDQS_PROXY_IMAGE_NAME"
)

bundle_images=(
    "$ELASTICSEARCH_IMAGE_NAME"
    "$QUICKSTATEMENTS_IMAGE_NAME"
)

for image in "${default_images[@]}"; do
    load_image "$image"
done

# load additional bundle images if needed
if [[ ! $SUITE == base__* ]]; then
    for image in "${bundle_images[@]}"; do
        load_image "$image"
    done
fi

echo "ℹ️  $(docker --version)" 2>&1 | tee -a "$TEST_LOG"

# Does it do anything to be adding the ":latest" tag to these?
export WIKIBASE_TEST_IMAGE_NAME="$WIKIBASE_TEST_IMAGE_NAME:latest"
export QUERYSERVICE_IMAGE_NAME="$QUERYSERVICE_IMAGE_NAME:latest"
export QUERYSERVICE_UI_IMAGE_NAME="$QUERYSERVICE_UI_IMAGE_NAME:latest"
export WDQS_PROXY_IMAGE_NAME="$WDQS_PROXY_IMAGE_NAME:latest"
export QUICKSTATEMENTS_IMAGE_NAME="$QUICKSTATEMENTS_IMAGE_NAME:latest"
export ELASTICSEARCH_IMAGE_NAME="$ELASTICSEARCH_IMAGE_NAME:latest"

export DEFAULT_SUITE_CONFIG="--env-file default.env -f suites/docker-compose.yml"

bash scripts/run_selenium.sh "$SUITE"
