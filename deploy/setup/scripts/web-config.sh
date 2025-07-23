#!/usr/bin/env bash
set -e

echo "🔧 Starting web-based configuration wizard..."

# --- Expected env vars ---
DEPLOY_DIR="${DEPLOY_DIR:?DEPLOY_DIR not set}"
LOG_PATH="${LOG_PATH:-/tmp/wbs-deploy-setup.log}"
VERBOSE="${VERBOSE:-false}"
LOCALHOST="${LOCALHOST:-false}"
CLOUD_INIT="${CLOUD_INIT:-false}"
CERT_EMAIL="${CERT_EMAIL:-wbs-setup@wikimedia.de}"

# -- Script specific env vars --
SETUP_PORT=8888
SETUP_DIR="$DEPLOY_DIR/setup"
CERTS_DIR="$SETUP_DIR/certs"
VIEWS_DIR="$SETUP_DIR/views"

# -- Setup logging --
# shellcheck disable=SC1091
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_logging.sh"

generate_cert_for_setup_webserver() {
  log "Generating TLS certificate for setup page..."

  if [ "$LOCALHOST" = true ]; then
    SETUP_HOST="localhost"
  else
    PUBLIC_IP=$(curl --silent --show-error --fail https://api.ipify.org)
    if [[ -z "$SETUP_HOST" ]]; then
      if [[ "$CLOUD_INIT" = true ]]; then
        SETUP_HOST="$PUBLIC_IP.nip.io"
      else
        SETUP_SUBDOMAIN="wbs-setup-$(LC_ALL=C tr -dc 'a-z0-9' </dev/urandom | head -c 6)"
        SETUP_HOST="$SETUP_SUBDOMAIN.$PUBLIC_IP.nip.io"
      fi
    fi
  fi

  log_cmd "mkdir -p $SETUP_DIR/letsencrypt $CERTS_DIR"
  log "Using domain: $SETUP_HOST"

  log_cmd "docker pull certbot/certbot"

  if log_cmd "docker run --rm \
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

  log_cmd "docker build $LOAD_FLAG -t wikibase/deploy-setup-webserver ."
  log_cmd "docker run -d \
    -p $SETUP_PORT:443 \
    -v $DEPLOY_DIR:/app/deploy \
    -v $VIEWS_DIR:/app/views \
    -v $CERTS_DIR:/app/certs \
    -v $LOG_PATH:/app/setup.log \
    wikibase/deploy-setup-webserver"

  echo
  echo "To continue setup navigate to:"
  echo
  echo "  https://$SETUP_HOST:$SETUP_PORT"
  echo
}

log "Starting setup page webserver container..."
cd "$SETUP_DIR"

generate_cert_for_setup_webserver
start_setup_webserver
