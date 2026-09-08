#!/bin/sh
set -eu

token_file=/run/secrets/query_access_token
if [ -r "$token_file" ]; then
  QLEVER_ACCESS_TOKEN="$(cat "$token_file")"
  export QLEVER_ACCESS_TOKEN
fi

exec php "/updater/${1:-updater.php}"
