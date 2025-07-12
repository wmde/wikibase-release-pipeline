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

PUBLIC_IP=$(curl $CURL_SILENT https://api.ipify.org)
# Random suffic keeps Let's Encrypt from rate limiting
SETUP_PAGE_DOMAIN_RAND_SUFFIX=$(head /dev/urandom | tr -dc a-z0-9 | head -c 6)
SETUP_PAGE_DOMAIN="wbs-setup-${SETUP_PAGE_DOMAIN_RAND_SUFFIX}.${PUBLIC_IP}.nip.io"
SETUP_PAGE_PORT=8888

CURL_SILENT="--silent --show-error --fail"

# Setup logging
mkdir -p "$WBS_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

log "Verbose mode enabled"

# --- Functions ---

start_message() {
    echo
    echo "Wikibase Suite Deploy Setup starting..."
    echo
}

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

  log_cmd "mkdir -p $DEPLOY_DIR/setup/letsencrypt $DEPLOY_DIR/setup/certs"
  log "Using domain: $SETUP_PAGE_DOMAIN"

  # Pre-pull certbot image to suppress output
  log_cmd "docker pull certbot/certbot"
  log_cmd "docker run --rm \
    -v "$DEPLOY_DIR/setup/letsencrypt:/etc/letsencrypt" \
    -v "$DEPLOY_DIR/setup/certs:/certs" \
    -p 80:80 \
    certbot/certbot certonly \
      --standalone \
      --non-interactive \
      --preferred-challenges http \
      --agree-tos \
      --email $EMAIL \
      -d $SETUP_PAGE_DOMAIN"

  CERT_PATH="$DEPLOY_DIR/setup/letsencrypt/live/$SETUP_PAGE_DOMAIN"
  cp "$CERT_PATH/fullchain.pem" "$DEPLOY_DIR/setup/certs/cert.pem"
  cp "$CERT_PATH/privkey.pem" "$DEPLOY_DIR/setup/certs/key.pem"
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
    deploy-setup-wizard"
}

wait_for_env_file() {
  echo "To complete setup navigate to:"
  echo
  echo "https://$SETUP_PAGE_DOMAIN:$SETUP_PAGE_PORT"
  echo
  until [ -f "$DEPLOY_DIR/.env" ]; do
    sleep 2
  done
  echo "Configuration saved."
}

launch_wikibase() {
  echo "Launching Wikibase Suite Docker containers..."
  log_cmd "cd $DEPLOY_DIR"
  log_cmd "docker compose up -d"
}

final_message() {
  echo
  echo "Setup is Complete!"
  echo

  if [[ -f "$DEPLOY_DIR/.env" ]]; then
    # Load key=value pairs from .env into current shell (safe since we control the format)
    while IFS= read -r line; do
      # Ignore comments and blank lines
      [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
      eval "export $line"
    done < "$DEPLOY_DIR/.env"

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
    sed 's/^/  /' "$DEPLOY_DIR/.env"
    echo
  else
    echo "⚠️ .env file not found at $DEPLOY_DIR/.env"
    echo
  fi
}

# --- Execution ---

start_message
setup_docker
install_docker_compose
clone_release_pipeline
start_setup_wizard_container
wait_for_env_file
launch_wikibase
final_message
