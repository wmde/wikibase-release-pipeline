#!/usr/bin/env bash
set -euo pipefail

echo
echo "🔧 Starting web-based configuration wizard..."
echo

# --- Expected env vars ---
DEPLOY_DIR="${DEPLOY_DIR:?DEPLOY_DIR not set}"
LOG_PATH="${LOG_PATH:-/tmp/wbs-deploy-setup.log}"
DEBUG="${DEBUG:-false}"
LOCALHOST="${LOCALHOST:-false}"
CERT_EMAIL="${CERT_EMAIL:-wbs-setup@wikimedia.de}"

# -- Script specific env vars --
SETUP_PORT=8888
SETUP_DIR="$DEPLOY_DIR/setup"
CERTS_DIR="$SETUP_DIR/certs"
VIEWS_DIR="$SETUP_DIR/views"
SERVER_IP=$(curl --silent --show-error --fail https://api.ipify.org || echo "127.0.0.1")
CERTBOT_IMAGE="${CERTBOT_IMAGE:-certbot/certbot:v4.2.0}"

# -- Setup logging --
# shellcheck disable=SC1091
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_logging.sh"

generate_cert_for_setup_webserver() {
  debug "Requesting a trusted HTTPS certificate for the setup page (ACME via Let’s Encrypt)..."

  if $LOCALHOST; then
    SETUP_HOST="localhost"
  else
    # Extra random suffix helps avoid LE rate limits during repeated runs
    SETUP_SUBDOMAIN="wbs-setup-$(hexdump -n 3 -v -e '/1 "%02x"' /dev/urandom)"
    SETUP_HOST="$SETUP_SUBDOMAIN.$SERVER_IP.nip.io"
  fi

  run "mkdir -p $SETUP_DIR/letsencrypt $CERTS_DIR"
  debug "Using domain: $SETUP_HOST"

  if ! $LOCALHOST; then
    run "docker run --rm \
      -v $SETUP_DIR/letsencrypt:/etc/letsencrypt \
      -v $CERTS_DIR:/certs \
      -p 80:80 \
      $CERTBOT_IMAGE certonly \
        --standalone \
        --non-interactive \
        --preferred-challenges http \
        --agree-tos \
        --email $CERT_EMAIL \
        -d $SETUP_HOST"

    LE_CERT_PATH="$SETUP_DIR/letsencrypt/live/$SETUP_HOST"
    if [ -f "$LE_CERT_PATH/fullchain.pem" ] && [ -f "$LE_CERT_PATH/privkey.pem" ]; then
      cp "$LE_CERT_PATH/fullchain.pem" "$CERTS_DIR/cert.pem"
      cp "$LE_CERT_PATH/privkey.pem" "$CERTS_DIR/key.pem"
      return 0
    fi
  fi

  # Fallback: self-signed cert
  run "openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -out $CERTS_DIR/cert.pem \
    -keyout $CERTS_DIR/key.pem \
    -subj /CN=$SETUP_HOST"
  SELF_SIGNED_CERT=true
}

start_setup_webserver() {
  # BuildKit (via buildx with the docker-container driver) does not load images
  # into the local Docker image store by default. --load ensures it's available
  # to `docker run`.
  BUILDKIT_DRIVER=$(docker buildx inspect | grep 'Driver:' | awk '{print $2}')
  if [ "$BUILDKIT_DRIVER" = "docker-container" ]; then
    LOAD_FLAG="--load"
  else
    LOAD_FLAG=""
  fi

  run "docker build $LOAD_FLAG -t wikibase/deploy-setup-webserver ."
  run "docker run -d \
    -e SERVER_IP=$SERVER_IP \
    -p $SETUP_PORT:443 \
    -v $DEPLOY_DIR:/app/deploy \
    -v $VIEWS_DIR:/app/views \
    -v $CERTS_DIR:/app/certs \
    -v $LOG_PATH:/app/setup.log \
    wikibase/deploy-setup-webserver"

  echo "To continue setup navigate to:"
  echo
  echo "  https://$SETUP_HOST:$SETUP_PORT"
  echo
  if [[ "${SELF_SIGNED_CERT:-false}" == true ]]; then
    echo "⚠️ This setup page is using a temporary self-signed HTTPS certificate."
    echo "Your browser will likely show a warning before loading the page."
    echo "See the Troubleshooting section of the Deploy Setup README for help"
    echo "if you want to bypass the warning or replace it with a trusted cert."
    echo
  fi
  if $LOCALHOST; then
    echo  It is now safe to close this terminal session.
    echo
  fi
}

debug "Starting setup page webserver container..."
cd "$SETUP_DIR"

generate_cert_for_setup_webserver
start_setup_webserver
