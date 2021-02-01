#!/bin/bash

function check_if_up {
    URL=$1
    if curl --fail --retry 60 --retry-all-errors --retry-delay 1 --max-time 10 --retry-max-time 60 --show-error --output /dev/null --silent "$URL"; then
        echo "Successfully loaded $URL!"
    else
        echo "Could not retrieve $URL"
        exit 1
    fi
}

check_if_up "$WIKIBASE_SERVER"/wiki/Main_Page

check_if_up "$QUERYSERVICE_SERVER"/bigdata/namespace/wdq/sparql

check_if_up "$QUERYSERVICE_UI_SERVER"