#!/usr/bin/env bash
set -e

echo "🔧 Starting web-based configuration wizard..."

# --- Parse args passed from go.sh ---
for arg in "$@"; do
  case $arg in
    --verbose=*) VERBOSE="${arg#*=}" ;;
    --deploy-dir=*) DEPLOY_DIR="${arg#*=}" ;;
    --log-path=*) LOG_PATH="${arg#*=}" ;;
    --local=*) LOCALHOST="${arg#*=}" ;;
  esac
done

# -- Setup logging -- 
# shellcheck disable=SC1091
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/_logging.sh"

SETUP_PORT=8888
CERT_EMAIL="${CERT_EMAIL:-wbs-setup@wikimedia.de}"

SETUP_DIR="$DEPLOY_DIR/setup"
CERTS_DIR="$SETUP_DIR/certs"
VIEWS_DIR="$SETUP_DIR/views"

generate_cert_for_setup_webserver() {
  log "Generating Let's Encrypt TLS certificate for setup page..."

  if [ "$LOCALHOST" = true ]; then
    SETUP_HOST=localhost
  else
    PUBLIC_IP=$(curl --silent --show-error --fail https://api.ipify.org)
    if [[ -z "$SETUP_HOST" ]]; then
      if [[ "$CLOUD_INIT" = "true" ]]; then
        SETUP_HOST=$PUBLIC_IP.nip.io
      else
        SETUP_SUBDOMAIN=wbs-setup-$(LC_ALL=C tr -dc 'a-z0-9' </dev/urandom | head -c 6)
        SETUP_HOST=$SETUP_SUBDOMAIN.$PUBLIC_IP.nip.io
      fi
    fi
  fi

  log_cmd "mkdir -p $SETUP_DIR/letsencrypt $CERTS_DIR"
  log "Using domain: $SETUP_HOST"

  log_cmd "docker pull certbot/certbot"

  if log_cmd "docker run --rm \
    -v $SETUP_DIR/letsencrypt:/etc/letsencrypt \
    -v $SETUP_DIR/certs:/certs \
    -p 80:80 \
    certbot/certbot certonly \
      --standalone \
      --non-interactive \
      --preferred-challenges http \
      --agree-tos \
      --email $CERT_EMAIL \
      -d $SETUP_HOST"; then

    CERT_PATH="$SETUP_DIR/letsencrypt/live/$SETUP_HOST"
    cp "$CERT_PATH/fullchain.pem" "$SETUP_DIR/certs/cert.pem"
    cp "$CERT_PATH/privkey.pem" "$SETUP_DIR/certs/key.pem"

  else
    echo "Let's Encrypt challenge failed, falling back to self-signed certificate."

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -out "$SETUP_DIR/certs/cert.pem" \
      -keyout "$SETUP_DIR/certs/key.pem" \
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
