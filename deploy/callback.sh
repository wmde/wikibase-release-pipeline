#!/usr/bin/env bash
set -u

# This script is part of Wikibase Suite Deploy
#
# This is part of an initiative to maintain an index of Wikibases. The goal of
# this index is to gather more quantitative data to learn more about how
# Wikibase is being used. We aim for this list to be a central hub for data
# re-use and federation initiatives between Wikibases, where users can discover
# other Wikibases easily.
#
# This script takes the configured URLs for Wikibase and WDQS and sends them to
# https://wikibase-metadata.toolforge.org in the form of a graphql request. The
# service running there will then periodically collect publicly accessible
# information from the instance. We can only access publicly visible
# information. If Wikibase requires a login to view data, we will not be able
# to collect statistics on the protected data. You can find more information in
# the README.md file.
#
# If you change your mind you can always remove your instance from the list by
# sending an E-Mail to wikibase-suite-support@wikimedia.de


if ! [ -v METADATA_CALLBACK  ] || ! [ "$METADATA_CALLBACK" = "true" ]; then
  echo "METADATA_CALLBACK not enabled. Exiting."
  exit 1
fi

if [ -z "$MW_WG_SERVER" ]; then
  echo "Callback Error: MW_WG_SERVER environment variable not set."
  exit 1
fi

if [ -z "$WDQS_PUBLIC_HOST" ]; then
  echo "Callback Error: WDQS_PUBLIC_HOST environment variable not set."
  exit 1
fi

if [[ "$MW_WG_SERVER" == *.example ]]; then
  echo "Callback Error: MW_WG_SERVER environment variable using invalid .example domain: $MW_WG_SERVER"
  exit 1
fi

if [[ "$MW_WG_SERVER" == *.localhost ]]; then
  echo "Callback Error: MW_WG_SERVER environment variable using invalid .localhost domain: $MW_WG_SERVER"
  exit 1
fi

GRAPHQL_URL="https://wikibase-metadata.toolforge.org/graphql"
PAYLOAD="{\"query\": \"mutation m { addWikibase(wikibaseInput: {\
      wikibaseName: \\\"$MW_WG_SERVER\\\", \
      urls: {\
        baseUrl: \\\"$MW_WG_SERVER\\\", \
        articlePath: \\\"/wiki\\\", \
        scriptPath: \\\"/w\\\", \
        sparqlFrontendUrl: \\\"https://$WDQS_PUBLIC_HOST\\\", \
        sparqlEndpointUrl: \\\"https://$WDQS_PUBLIC_HOST/sparql\\\", \
      } \
    }) { \
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
  echo "Callback Error sending request: curl command failed."
  exit 1
fi

if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
  echo "Callback Request successful"
else
  echo "Callback Error: Request failed"
fi

echo "$HTTP_STATUS"
echo "$RESPONSE_BODY"
