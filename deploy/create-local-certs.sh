#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------------------------------------
# create-local-certs.sh
#
# Generate local TLS certs with mkcert for the hosts in .env:
#   WIKIBASE_PUBLIC_HOST
#   WDQS_PUBLIC_HOST
# Output files: config/certs/<domain>.crt and .key
#
# Requires:
#   - mkcert (https://github.com/FiloSottile/mkcert)
#   - Completed WBS Deploy configuration (.env present with above vars)
# ----------------------------------------------------------------------

# --- Check mkcert is installed ---
if ! command -v mkcert >/dev/null 2>&1; then
  echo "Error: mkcert is not installed."
  echo "Please install mkcert first: https://github.com/FiloSottile/mkcert#installation"
  exit 1
fi

# --- Ensure .env exists ---
if [[ ! -f .env ]]; then
  echo "⚠️  Error: .env file not found. Please complete WBS Deploy configuration first."
  exit 1
fi

# --- Extract domains from .env ---
WIKIBASE_PUBLIC_HOST=$(grep -E '^WIKIBASE_PUBLIC_HOST=' .env | cut -d '=' -f2- | tr -d '"')
WDQS_PUBLIC_HOST=$(grep -E '^WDQS_PUBLIC_HOST=' .env | cut -d '=' -f2- | tr -d '"')

# --- Validate values ---
if [[ -z "$WIKIBASE_PUBLIC_HOST" || -z "$WDQS_PUBLIC_HOST" ]]; then
  echo "⚠️  Error: WIKIBASE_PUBLIC_HOST or WDQS_PUBLIC_HOST is missing in .env."
  echo "Please set these values in .env before running this script."
  exit 1
fi

DOMAINS=("$WIKIBASE_PUBLIC_HOST" "$WDQS_PUBLIC_HOST")

# --- Target directory for certs ---
CERT_DIR="./config/certs"
mkdir -p "$CERT_DIR"

# --- Ensure mkcert CA is installed (idempotent) ---
mkcert -install

# --- Generate certs for each domain ---
for domain in "${DOMAINS[@]}"; do
  cert="$CERT_DIR/${domain}.crt"
  key="$CERT_DIR/${domain}.key"
  mkcert -cert-file "$cert" -key-file "$key" "$domain"
done

# --- Append CADDY_TLS_FILE_PATH to .env if not already present ---
if ! grep -q '^CADDY_TLS_FILE_PATH=' .env; then
  echo "" >> .env
  echo "CADDY_TLS_FILE_PATH=./config/Caddyfile.files.tls" >> .env
  echo "Added CADDY_TLS_FILE_PATH to .env"
fi
