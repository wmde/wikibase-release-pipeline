#!/usr/bin/env bash
set -e

# --- Config ---

VERBOSE=false
EMAIL="wbs-setup@wikimedia.de"
for arg in "$@"; do
  [[ "$arg" == "--verbose" ]] && VERBOSE=true
  [[ "$arg" == --email=* ]] && EMAIL="${arg#*=}"
done

# Allow verbosity and email via env
if [[ "$DEPLOY_SETUP_VERBOSE" == "true" ]]; then
  VERBOSE=true
fi

# Require a real email
if [[ -z "$EMAIL" ]]; then
  echo "❌ Error: No email provided for Let's Encrypt."
  echo "Use --email=you@example.com or set DEPLOY_SETUP_EMAIL"
  exit 1
fi

log() {
  if $VERBOSE; then
    echo "$@"
  fi
}

log_cmd() {
  if $VERBOSE; then
    bash -c "$@"
  else
    bash -c "$@" &> /dev/null
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
  log_cmd "curl -fsSL https://get.docker.com | sh"
  log_cmd "systemctl enable --now docker"
}

install_docker_compose() {
  log "Installing Docker Compose plugin..."
  mkdir -p ~/.docker/cli-plugins
  log_cmd "curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o ~/.docker/cli-plugins/docker-compose"
  chmod +x ~/.docker/cli-plugins/docker-compose
}

clone_release_pipeline() {
  log "Cloning Wikibase Release Pipeline repository..."
  cd "$WBS_DIR"
  log_cmd "git clone $REPO_URL"
  cd wikibase-release-pipeline
  log_cmd "git checkout cloud-config-test"
}

generate_lets_encrypt_cert() {
  log "Generating Let's Encrypt TLS certificate..."

  mkdir -p "$DEPLOY_DIR/setup/letsencrypt" "$DEPLOY_DIR/setup/certs"

  RAND_SUFFIX=$(head /dev/urandom | tr -dc a-z0-9 | head -c 6)
  CERT_DOMAIN="wbs-setup-${RAND_SUFFIX}.${PUBLIC_IP}.nip.io"

  log "Using domain: $CERT_DOMAIN"

  # Pre-pull certbot image to suppress output
  log_cmd "docker pull certbot/certbot"

  docker run --rm \
    -v "$DEPLOY_DIR/setup/letsencrypt:/etc/letsencrypt" \
    -v "$DEPLOY_DIR/setup/certs:/certs" \
    -p 80:80 \
    certbot/certbot certonly \
      --standalone \
      --non-interactive \
      --preferred-challenges http \
      --agree-tos \
      --email "$EMAIL" \
      -d "$CERT_DOMAIN"

  CERT_PATH="$DEPLOY_DIR/setup/letsencrypt/live/$CERT_DOMAIN"
  ln -sf "$CERT_PATH/fullchain.pem" "$DEPLOY_DIR/setup/certs/cert.pem"
  ln -sf "$CERT_PATH/privkey.pem" "$DEPLOY_DIR/setup/certs/key.pem"
}

start_setup_wizard_container() {
  log "Starting setup webserver container..."
  cd "$DEPLOY_DIR/setup"

  generate_lets_encrypt_cert

  log_cmd "docker build -t deploy-setup-wizard ."
  log_cmd "docker run -d \
    --name deploy-setup-wizard \
    -p $SETUP_PAGE_PORT:443 \
    -v $DEPLOY_DIR:/data \
    -v $DEPLOY_DIR/setup/certs:/certs \
    -v $LOG_FILE:/log/deploy-setup.log:ro \
    -e SETUP_DOMAIN=$CERT_DOMAIN \
    deploy-setup-wizard"
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
  log_cmd "docker compose --ansi always up -d"
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