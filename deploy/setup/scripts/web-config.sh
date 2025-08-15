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

# -- Setup logging --
# shellcheck disable=SC1091
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_logging.sh"

generate_cert_for_setup_webserver() {
  debug "Generating TLS certificate for setup page..."

  if $LOCALHOST; then
    SETUP_HOST="localhost"
  else
    # Extra random suffix is to keep Let's Encrypt from rate limiting on cert generation
    # after repeated runs (in dev, testing, and debugging cases in particular)
    SETUP_SUBDOMAIN="wbs-setup-$(hexdump -n 3 -v -e '/1 "%02x"' /dev/urandom)"
    SETUP_HOST="$SETUP_SUBDOMAIN.$SERVER_IP.nip.io"
  fi

  run "mkdir -p $SETUP_DIR/letsencrypt $CERTS_DIR"
  debug "Using domain: $SETUP_HOST"

  run "docker pull certbot/certbot"

  if run "docker run --rm \
    -v $SETUP_DIR/letsencrypt:/etc/letsencrypt \
    -v $CERTS_DIR:/certs \
    -p 80:80 \
    certbot/certbot certonly \
      --standalone \
      --non-interactive \
      --preferred-challenges http \
      --agree-tos \
      --email $CERT_EMAIL \
      -d $SETUP_HOST"; then

    LE_CERT_PATH="$SETUP_DIR/letsencrypt/live/$SETUP_HOST"
    cp "$LE_CERT_PATH/fullchain.pem" "$CERTS_DIR/cert.pem"
    cp "$LE_CERT_PATH/privkey.pem" "$CERTS_DIR/key.pem"
  else
    echo "⚠️ Let's Encrypt challenge failed, falling back to self-signed certificate."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -out "$CERTS_DIR/cert.pem" \
      -keyout "$CERTS_DIR/key.pem" \
      -subj "/CN=$SETUP_HOST"
  fi
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
  if $LOCALHOST; then
    echo
    echo  It is now safe to close this terminal session.
  fi
}

debug "Starting setup page webserver container..."
cd "$SETUP_DIR"

generate_cert_for_setup_webserver
start_setup_webserver
