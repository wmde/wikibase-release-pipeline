#!/usr/bin/env bash
set -e

# --- Config ---

VERBOSE=false
for arg in "$@"; do
  [[ "$arg" == "--verbose" ]] && VERBOSE=true
done

# Allow verbosity via env var too
if [[ "$DEPLOY_SETUP_VERBOSE" == "true" ]]; then
  VERBOSE=true
fi

log() {
  if $VERBOSE; then
    echo "$@"
  fi
}

# Constants
WBS_DIR="/opt/wbs"
REPO_URL="https://github.com/wmde/wikibase-release-pipeline.git"
DEPLOY_DIR="$WBS_DIR/wikibase-release-pipeline/deploy"
LOG_FILE="$WBS_DIR/deploy-setup.log"
SETUP_PAGE_PORT=8888

# Get public IP
CURL_SILENT="--silent --show-error --fail"
PUBLIC_IP=$(curl $CURL_SILENT https://api.ipify.org)

# Setup logging
mkdir -p "$WBS_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

log "Verbose mode enabled"

# --- Functions ---

setup_docker() {
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  log "Docker installed"

  log "Enabling and starting Docker service..."
  systemctl enable --now docker
}

install_docker_compose() {
  log "Installing Docker Compose plugin..."
  mkdir -p ~/.docker/cli-plugins
  curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o ~/.docker/cli-plugins/docker-compose
  chmod +x ~/.docker/cli-plugins/docker-compose
}

clone_release_pipeline() {
  log "Cloning Wikibase Release Pipeline repository..."
  cd "$WBS_DIR"
  git clone "$REPO_URL"
  cd wikibase-release-pipeline
  git checkout cloud-config-test  # TODO: Remove once stable
}

generate_lets_encrypt_cert() {
  log "Generating Let's Encrypt TLS certificate..."

  mkdir -p "$DEPLOY_DIR/setup/letsencrypt" "$DEPLOY_DIR/setup/certs"

  RAND_SUFFIX=$(head /dev/urandom | tr -dc a-z0-9 | head -c 6)
  CERT_DOMAIN="wbs-setup-${RAND_SUFFIX}.${PUBLIC_IP}.nip.io"

  log "Using domain: $CERT_DOMAIN"

  docker run --rm \
    -v "$DEPLOY_DIR/setup/letsencrypt:/etc/letsencrypt" \
    -v "$DEPLOY_DIR/setup/certs:/certs" \
    -p 80:80 \
    certbot/certbot certonly \
      --standalone \
      --preferred-challenges http \
      --agree-tos \
      --no-eff-email \
      --email you@example.com \
      -d "$CERT_DOMAIN"

  CERT_PATH="$DEPLOY_DIR/setup/letsencrypt/live/$CERT_DOMAIN"
  ln -sf "$CERT_PATH/fullchain.pem" "$DEPLOY_DIR/setup/certs/cert.pem"
  ln -sf "$CERT_PATH/privkey.pem" "$DEPLOY_DIR/setup/certs/key.pem"
}

start_setup_wizard_container() {
  log "Starting setup webserver container..."
  cd "$DEPLOY_DIR/setup"

  generate_lets_encrypt_cert

  docker build -t deploy-setup-wizard .
  docker run -d \
    --name deploy-setup-wizard \
    -p $SETUP_PAGE_PORT:443 \
    -v "$DEPLOY_DIR:/data" \
    -v "$DEPLOY_DIR/setup/certs:/certs" \
    -v "$LOG_FILE:/log/deploy-setup.log:ro" \
    -e SETUP_DOMAIN="$CERT_DOMAIN" \
    deploy-setup-wizard
}

wait_for_env_file() {
  log "Waiting for $DEPLOY_DIR/.env to be created..."
  until [ -f "$DEPLOY_DIR/.env" ]; do
    sleep 2
  done
  log ".env file detected. Proceeding with deployment..."
}

launch_wikibase() {
  log "Launching Wikibase Suite containers..."
  cd "$DEPLOY_DIR"
  docker compose --ansi always up -d
}

final_message() {
  echo
  echo "Wikibase Suite Deploy Setup started"
  echo "To continue setup navigate to:"
  echo "  https://$CERT_DOMAIN:$SETUP_PAGE_PORT"
}

# --- Execution ---

setup_docker
install_docker_compose
clone_release_pipeline
start_setup_wizard_container
wait_for_env_file
launch_wikibase
final_message
