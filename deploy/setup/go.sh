#!/usr/bin/env bash
set -e

# --- Config ---
SETUP_URL="https://raw.githubusercontent.com/wmde/wikibase-release-pipeline/refs/heads/deploy-setup-script/deploy/setup/setup.sh"
SETUP_LOCAL="/tmp/wbs-deploy-setup.sh"

# --- Download ---
curl -fsSL "$SETUP_URL" -o "$SETUP_LOCAL"
chmod +x "$SETUP_LOCAL"

# --- Run with forwarded CLI args ---
bash "$SETUP_LOCAL" "$@"
