#!/bin/sh
set -eu

token_file=/run/secrets/query_access_token
if [ -r "$token_file" ]; then
  export QLEVER_ACCESS_TOKEN="$(cat "$token_file")"
fi

exec php "/updater/${1:-updater.php}"
