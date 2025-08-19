#!/usr/bin/env bash
set -euo pipefail

# --- Expected Variables ---

export DEBUG
export DEV
export LOCALHOST
export LOG_PATH
export DEPLOY_DIR
export SCRIPTS_DIR
export SETUP_DIR

ENV_FILE_PATH="$DEPLOY_DIR/.env"

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"

# --- Functions ---

wait_for_env_file() {
  until [ -s "$ENV_FILE_PATH" ]; do sleep 2; done
  debug "Configuration saved."
}

launch_wikibase() (
  pushd "$DEPLOY_DIR" >/dev/null || return 1

  local opts=(-d)

  if [ "$DEBUG" != true ]; then opts+=(--quiet-pull); fi

  if $DEV && [ -f "docker-compose.local.yml" ]; then
    status "⛔️ Any existing wbs-deploy services are now being removed including any data and configuration (DEV=true)"
    run "rm -f config/LocalSettings.php"
    run "docker compose -f docker-compose.yml -f docker-compose.local.yml down --volumes"
    run "docker compose down --volumes"
  fi

  status "Waiting for services to start. Generally takes 2–6 minutes..."

  if $DEV && [ -f "docker-compose.local.yml" ]; then
    run "docker compose -f docker-compose.yml -f docker-compose.local.yml up ${opts[*]}"
  else
    run "docker compose up ${opts[*]}"
  fi

  popd >/dev/null || return 1
)

# NOTE: final_message intentionally uses echo+tee for a clean human banner on stdout.
# The block is also appended to the log via tee, but WITHOUT timestamps/levels.
final_message() {
  {
    echo
    echo "✅ Setup is Complete!"
    echo
    if [[ -f "$ENV_FILE_PATH" ]]; then
      # shellcheck disable=SC1090
      source "$ENV_FILE_PATH"

      if [[ -n "${WIKIBASE_PUBLIC_HOST:-}" ]]; then
        echo "Your Wikibase Suite services can be found at:"
        echo
        echo "MediaWiki/Wikibase:"
        echo "https://$WIKIBASE_PUBLIC_HOST"
        echo
        echo "Query Service:"
        echo "https://${WDQS_PUBLIC_HOST:-query.$WIKIBASE_PUBLIC_HOST}"
        echo
        echo "QuickStatements:"
        echo "https://$WIKIBASE_PUBLIC_HOST/tools/quickstatements"
        echo
      else
        echo "⚠️ Could not determine WIKIBASE_PUBLIC_HOST from .env"
      fi

      echo
      echo "The following configuration was saved during setup."
      echo "Please save these credentials and settings securely:"
      echo
      sed 's/^/  /' "$ENV_FILE_PATH"
      echo
    else
      echo "⚠️ .env file not found at $ENV_FILE_PATH"
      echo
    fi
  } | tee -a "$LOG_PATH"
}

# --- Execution ---

wait_for_env_file
launch_wikibase
final_message
