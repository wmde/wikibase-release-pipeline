#!/usr/bin/env bash
set -e

# --- Parse CLI Arguments ---

for arg in "$@"; do
  case "$arg" in
    --cloud-init)
      CLOUD_INIT=true
      ;;
    --dev)
      DEV=true
      SKIP_DEPENDENCY_INSTALLS=true
      ;;
    --skip-dependency-installs)
      SKIP_DEPENDENCY_INSTALLS=true
      ;;
    --verbose)
      VERBOSE=true
      ;;
  esac
done

# --- Assign Vars with Defaults ---

CLOUD_INIT="${CLOUD_INIT:-false}"
DEV="${DEV:-false}"
SKIP_DEPENDENCY_INSTALLS="${SKIP_DEPENDENCY_INSTALLS:-false}"
VERBOSE="${VERBOSE:-false}"

CERT_EMAIL="${CERT_EMAIL:-wbs-setup@wikimedia.de}"
REPO_URL="${REPO_URL:-https://github.com/wmde/wikibase-release-pipeline.git}"

if [ "$DEV" = true ]; then
  WBS_DIR="${WBS_DIR:-../../..}"
else
  WBS_DIR="${WBS_DIR:-/opt/wbs}"
fi

DEPLOY_DIR="${DEPLOY_DIR:-$WBS_DIR/wikibase-release-pipeline/deploy}"
SETUP_DIR="${SETUP_DIR:-$DEPLOY_DIR/setup}"
LOG_PATH="${LOG_PATH:-$WBS_DIR/setup.log}"

if [ "$DEV" = true ]; then
  SETUP_HOST="${SETUP_HOST:-localhost}"
fi

# -- Setup host for SSL cert generation --

PUBLIC_IP=$(curl --silent --show-error --fail https://api.ipify.org)
SETUP_PORT=8888
if [[ -z "$SETUP_HOST" ]]; then
  # Random suffix keeps Let's Encrypt from rate limiting
  # but not in CLOUD_INIT so that the setup webserver address
  # remains known (https://<SERVER-IP>.nip.io:8888) in that case. 
  if [[ "$CLOUD_INIT" = "true" ]]; then
    SETUP_HOST=$PUBLIC_IP.nip.io
  else
    SETUP_SUBDOMAIN=wbs-setup-$(LC_ALL=C tr -dc 'a-z0-9' </dev/urandom | head -c 6)
    SETUP_HOST=$SETUP_SUBDOMAIN.$PUBLIC_IP.nip.io
  fi
fi

# -- Setup logging --

mkdir -p "$WBS_DIR"
touch "$LOG_PATH"

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

  return $?
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

generate_cert_for_setup_webserver() {
  log "Generating Let's Encrypt TLS certificate for setup page..."

  log_cmd "mkdir -p $SETUP_DIR/letsencrypt $SETUP_DIR/certs"
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
  log "Starting setup page webserver container..."
  cd "$SETUP_DIR"

  generate_cert_for_setup_webserver

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
    -v $DEPLOY_DIR/setup/views:/app/views \
    -v $SETUP_DIR/certs:/app/certs \
    -v $LOG_PATH:/app/setup.log \
    wikibase/deploy-setup-webserver"

  echo
  echo "To continue setup navigate to:"
  echo
  echo "  https://$SETUP_HOST:$SETUP_PORT"
  echo
}

# -- Run Setup --

exec > >(tee -a "$LOG_PATH") 2>&1
# clear || printf "\033c"
echo
echo "Wikibase Suite Deploy Setup"
echo

if ! $SKIP_DEPENDENCY_INSTALLS; then
  install_git
  install_docker
else
  echo "Skipping dependency checks and installations..."
fi
if ! $DEV; then
  clone_repo
fi
start_setup_webserver

# -- Launch services --

if ! $DEV; then
  # Launch second phase in background, passing relevant env vars
  setsid env \
    DEPLOY_DIR="$DEPLOY_DIR" \
    VERBOSE="$VERBOSE" \
    bash "$SETUP_DIR/launch.sh" >> "$LOG_PATH" 2>&1 < /dev/null &
  exit 0
fi
