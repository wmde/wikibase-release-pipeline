#!/usr/bin/env bash

# Perform the health check using curl
if curl --silent --fail "http://localhost:9999/bigdata/namespace/wdq/sparql" > /dev/null; then
  echo "Health check passed."
  exit 0
else
  echo "Health check failed."
  exit 1
fi
