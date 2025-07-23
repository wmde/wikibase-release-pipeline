#!/usr/bin/env bash
set -e

# Depends on the following vars being already defined:
# $DEPLOY_DIR
# $VERBOSE
ENV_FILE_PATH="$DEPLOY_DIR/.env"

wait_for_env_file() {
  # -s .env exists and is not empty
  until [ -s "$ENV_FILE_PATH" ]; do
    sleep 2
  done
  echo "Configuration saved."
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
  echo "Setup is Complete!"
  echo

  if [[ -f "$ENV_FILE_PATH" ]]; then
    while IFS= read -r line; do
      [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
      eval "export $line"
    done < "$ENV_FILE_PATH"

    if [[ -n "$WIKIBASE_PUBLIC_HOST" ]]; then
      echo "Access your MediaWiki / Wikibase instance at:"
      echo
      echo "  https://$WIKIBASE_PUBLIC_HOST"
    else
      echo "⚠️ Could not determine WIKIBASE_PUBLIC_HOST from .env"
    fi

    echo
    echo "The following configuration was generated during setup."
    echo "Please copy and save these credentials and settings securely:"
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
