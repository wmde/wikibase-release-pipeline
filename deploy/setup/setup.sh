#!/usr/bin/env bash
set -e

# --- Config CLI ---

# Default values (can be overridden by CLI)
VERBOSE="${VERBOSE:-false}"
SKIP_DOCKER_INSTALL="${SKIP_DOCKER_INSTALL:-false}"
CERT_EMAIL="${CERT_EMAIL:-wbs-setup@wikimedia.de}"

# CLI overrides
for arg in "$@"; do
  case "$arg" in
    --verbose)
      VERBOSE=true
      ;;
    --skip-docker-install)
      SKIP_DOCKER_INSTALL=true
      ;;
    --cert-email=*)
      CERT_EMAIL="${arg#*=}"
      ;;
  esac
done

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

  return $?  # Pass the exit code back to caller
}

# Constants
WBS_DIR="/opt/wbs"
LOG_PATH="$WBS_DIR/setup.log"
REPO_URL="https://github.com/wmde/wikibase-release-pipeline.git"
DEPLOY_DIR="$WBS_DIR/wikibase-release-pipeline/deploy"
SETUP_DIR="$DEPLOY_DIR/setup"
ENV_FILE_PATH="$DEPLOY_DIR/.env"

PUBLIC_IP=$(curl --silent --show-error --fail https://api.ipify.org)
# Random suffix keeps Let's Encrypt from rate limiting
SETUP_SUBDOMAIN=wbs-setup-$(LC_ALL=C tr -dc 'a-z0-9' </dev/urandom | head -c 6)
SETUP_HOST=$SETUP_SUBDOMAIN.$PUBLIC_IP.nip.io
SETUP_PORT=8888

# Setup logging
mkdir -p "$WBS_DIR"
touch $LOG_PATH
exec > >(tee -a "$LOG_PATH") 2>&1

log "Verbose mode enabled"

# --- Functions ---

start_message() {
  echo
  echo "Wikibase Suite Deploy Setup"
  echo
}

install_git() {
  if command -v git &>/dev/null; then
    log "Git already installed"
    return
  fi

  echo "Installing Git..."

  if command -v apt-get &>/dev/null; then
    log_cmd "apt-get update && apt-get install -y git"
  elif command -v dnf &>/dev/null; then
    log_cmd "dnf install -y git"
  elif command -v yum &>/dev/null; then
    log_cmd "yum install -y git"
  elif command -v apk &>/dev/null; then
    log_cmd "apk add git"
  elif command -v pacman &>/dev/null; then
    log_cmd "pacman -Sy --noconfirm git"
  else
    echo "⚠️ Unsupported package manager. Please install Git manually."
    exit 1
  fi
}

install_docker() {
  echo "Installing Docker..."
  log_cmd "curl -fsSL https://get.docker.com | sh"
  log_cmd "systemctl enable --now docker"
  echo "Installing Docker Compose plugin..."
  mkdir -p ~/.docker/cli-plugins
  log_cmd "curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o ~/.docker/cli-plugins/docker-compose"
  chmod +x ~/.docker/cli-plugins/docker-compose
}

clone_repo() {
  echo "Cloning Wikibase Release Pipeline repository..."
  cd "$WBS_DIR"
  log_cmd "git clone $REPO_URL"
  cd wikibase-release-pipeline
  log_cmd "git checkout deploy-setup-script"
}

generate_ssl_cert_for_setup_webserver() {
  log "Generating Let's Encrypt TLS certificate for setup page..."

  log_cmd "mkdir -p $SETUP_DIR/letsencrypt $SETUP_DIR/certs"
  log "Using domain: $SETUP_HOST"

  # Pre-pull certbot image to suppress output
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

start_config_webserver() {
  log "Starting setup page webserver container..."
  cd "$SETUP_DIR"

  generate_ssl_cert_for_setup_webserver
  
  # Makes compatible with environments that have Buildx installed which
  # Add --load only if using docker-container driver
  BUILDX_DRIVER=$(docker buildx inspect | grep 'Driver:' | awk '{print $2}')
  if [ "$BUILDX_DRIVER" = "docker-container" ]; then
    LOAD_FLAG="--load"
  else
    LOAD_FLAG=""
  fi

  log_cmd "docker build $LOAD_FLAG -t wikibase/deploy-setup-webserver ."
  log_cmd "docker run -d \
    -p $SETUP_PORT:443 \
    -v $DEPLOY_DIR:/app/deploy \
    -v $SETUP_DIR/certs:/app/certs \
    -v $LOG_PATH:/app/setup.log \
    wikibase/deploy-setup-webserver"
  echo
  echo "To complete setup navigate to:"
  echo
  echo "https://$SETUP_HOST:$SETUP_PORT"
  echo
}

wait_for_env_file() {
  until [ -f "$ENV_FILE_PATH" ]; do
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

  if [[ -f "$ENV_FILE_PATH" ]]; then
    # Load key=value pairs from .env into current shell (safe since we control the format)
    while IFS= read -r line; do
      # Ignore comments and blank lines
      [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
      eval "export $line"
    done < "$ENV_FILE_PATH"

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
    sed 's/^/  /' "$ENV_FILE_PATH"
    echo
  else
    echo "⚠️ .env file not found at $ENV_FILE_PATH"
    echo
  fi
}

# --- Execution ---

start_message
install_git
if [[ "$SKIP_DOCKER_INSTALL" != "true" ]]; then
  install_docker
else
  echo "Skipping Docker installation"
fi
clone_repo
start_config_webserver
wait_for_env_file
launch_wikibase
final_message
