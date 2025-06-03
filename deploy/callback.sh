#!/usr/bin/env bash
set -eu

# This script is part of Wikibase Suite Deploy
# TODO: Explain this script in detail

if ! [ -v METADATA_CALLBACK  ] || ! [ "$METADATA_CALLBACK" = "true" ]; then
  echo "METADATA_CALLBACK not enabled. Exiting."
  exit 1
fi

if [ -z "$MW_WG_SERVER" ]; then
  echo "Error: MW_WG_SERVER environment variable not set."
  exit 1
fi

if [ -z "$WDQS_PUBLIC_HOST" ]; then
  echo "Error: WDQS_PUBLIC_HOST environment variable not set."
  exit 1
fi

if [[ "$MW_WG_SERVER" == *.example ]]; then
  echo "Error: MW_WG_SERVER environment variable using invalid .example domain: $MW_WG_SERVER"
  exit 1
fi

if [[ "$MW_WG_SERVER" == *.localhost ]]; then
  echo "Error: MW_WG_SERVER environment variable using invalid .localhost domain: $MW_WG_SERVER"
  exit 1
fi

GRAPHQL_URL="https://wikibase-metadata.toolforge.org/graphql"
PAYLOAD="{\"query\": \"mutation m { addWikibase(wikibaseInput: {\
  wikibaseName: \\\"$MW_WG_SERVER\\\", \
  urls: {\
    baseUrl: \\\"$MW_WG_SERVER\\\", \
    actionApiUrl: \\\"$MW_WG_SERVER/w/api.php\\\", \
    indexApiUrl: \\\"$MW_WG_SERVER/w/index.php\\\", \
    sparqlQueryUrl: \\\"https://$WDQS_PUBLIC_HOST\\\", \
    sparqlEndpointUrl: \\\"https://$WDQS_PUBLIC_HOST/sparql\\\", \
    specialStatisticsUrl: \\\"$MW_WG_SERVER/wiki/Special:Statistics\\\", \
    specialVersionUrl: \\\"$MW_WG_SERVER/wiki/Special:Version\\\"}}) { \
      id \
    } \
  }\"\
}"


echo "Trying to register at $GRAPHQL_URL with $PAYLOAD..."

# Capture curl output (body + newline + http_code)
CURL_OUTPUT=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$GRAPHQL_URL")

# Extract body and status code
RESPONSE_BODY="${CURL_OUTPUT%$'\n'*}"
HTTP_STATUS="${CURL_OUTPUT##*$'\n'}"

# shellcheck disable=SC2181
if [ $? -ne 0 ]; then
  echo "Error sending request: curl command failed."
  exit 1
fi

if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
  echo "Request successful"
else
  echo "Request failed"
fi

echo "$HTTP_STATUS"
echo "$RESPONSE_BODY"
