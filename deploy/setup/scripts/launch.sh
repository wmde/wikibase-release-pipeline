#!/usr/bin/env bash
set -e

# --- Expected env vars ---
DEPLOY_DIR="${DEPLOY_DIR:?DEPLOY_DIR not set}"
VERBOSE="${VERBOSE:-false}"

# -- Setup logging --
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/_logging.sh"

ENV_FILE_PATH="$DEPLOY_DIR/.env"

wait_for_env_file() {
  # -s: file exists AND is not empty
  until [ -s "$ENV_FILE_PATH" ]; do
    sleep 2
  done
  log "Configuration saved."
}

launch_wikibase() {
  echo "Launching Wikibase Suite Docker containers..."
  cd "$DEPLOY_DIR"

  COMPOSE_OPTIONS=(-d)
  if [ "$VERBOSE" != true ]; then
    COMPOSE_OPTIONS+=(--quiet-pull)
  fi

  docker compose up "${COMPOSE_OPTIONS[@]}"
}

final_message() {
  echo
  echo "✅ Setup is Complete!"
  echo

  if [[ -f "$ENV_FILE_PATH" ]]; then
    while IFS= read -r line; do
      [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
      eval "export $line"
    done < "$ENV_FILE_PATH"

    if [[ -n "$WIKIBASE_PUBLIC_HOST" ]]; then
      echo Your Wikibase Suite services can be found at:
      echo
      echo MediaWiki/Wikibase: 
      echo https://"$WIKIBASE_PUBLIC_HOST"
      echo
      echo Query Service:
      echo https://"$WDQS_PUBLIC_HOST"/tools/quickstatements
      echo 
      echo QuickStatements:
      echo https://"$WIKIBASE_PUBLIC_HOST"/tools/quickstatements
      echo 
    else
      echo "⚠️ Could not determine WIKIBASE_PUBLIC_HOST from .env"
    fi

    echo
    echo "The following configuration saved during setup."
    echo "Please save these credentials and settings securely:"
    echo
    sed 's/^/  /' "$ENV_FILE_PATH"
    echo
  else
    echo "⚠️ .env file not found at $ENV_FILE_PATH"
    echo
  fi
}

wait_for_env_file
launch_wikibase
final_message
