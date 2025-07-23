#!/usr/bin/env bash
set -e

# --- Parse CLI Arguments ---

for arg in "$@"; do
  case "$arg" in
    --cloud-init)
      CLOUD_INIT=true
      ;;
    --dev)
      SKIP_CLONE=true
      SKIP_DEPENDENCY_INSTALLS=true
      SKIP_LAUNCH=true
      # Root directory above repo
      WBS_DIR=../../..
      ;;
    --local)
      LOCALHOST=true
      ;;
    --skip-clone)
      SKIP_CLONE=true
      ;;
    --skip-deps)
      SKIP_DEPENDENCY_INSTALLS=true
      ;;
    --skip-launch)
      SKIP_LAUNCH=true
      ;;
    --verbose)
      VERBOSE=true
      ;;
    --web)
      USE_WEB=true
      ;;
  esac
done

# --- Assign Vars with Defaults ---

CLOUD_INIT="${CLOUD_INIT:-false}"
LOCALHOST="${LOCALHOST:-false}"
SKIP_CLONE="${SKIP_CLONE:-false}"
SKIP_DEPENDENCY_INSTALLS="${SKIP_DEPENDENCY_INSTALLS:-false}"
SKIP_LAUNCH="${SKIP_LAUNCH:-false}"
REPO_URL="${REPO_URL:-https://github.com/wmde/wikibase-release-pipeline.git}"
USE_WEB="${USE_WEB:-false}"
VERBOSE="${VERBOSE:-false}"
WBS_DIR="${WBS_DIR:-/opt/wbs}"
DEPLOY_DIR="${DEPLOY_DIR:-$WBS_DIR/wikibase-release-pipeline/deploy}"
SETUP_DIR="${SETUP_DIR:-$DEPLOY_DIR/setup}"
SCRIPTS_DIR="$SETUP_DIR/scripts"
LOG_PATH="${LOG_PATH:-/tmp/wbs-deploy-setup.log}"

# -- Setup logging --

mkdir -p "$(dirname "$LOG_PATH")"
touch "$LOG_PATH" 2>/dev/null || true

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
    echo "\u26a0\ufe0f Unsupported package manager. Please install Git manually."
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
  mkdir -p "$WBS_DIR"
  cd "$WBS_DIR"
  log_cmd "git clone $REPO_URL"
  cd wikibase-release-pipeline
  log_cmd "git checkout deploy-setup-script"
}

# -- Start Setup --

exec > >(tee -a "$LOG_PATH") 2>&1

echo
echo "Wikibase Suite Deploy Setup"
echo

if ! $SKIP_DEPENDENCY_INSTALLS; then
  install_git
  install_docker
else
  echo "Skipping dependency checks and installations..."
fi

if ! $SKIP_CLONE; then
  clone_repo
fi

# -- Run web or CLI config depending on what was selected--

if $USE_WEB; then
  bash "$SCRIPTS_DIR/web-config.sh" \
    --verbose="$VERBOSE" \
    --deploy-dir="$DEPLOY_DIR" \
    --log-path="$LOG_PATH" \
    --local="$LOCALHOST"
else
  bash "$SCRIPTS_DIR/cli-config.sh" \
    --verbose="$VERBOSE" \
    --deploy-dir="$DEPLOY_DIR" \
    --log-path="$LOG_PATH" \
    --local="$LOCALHOST"
fi

if ! $SKIP_LAUNCH; then
  setsid env \
    DEPLOY_DIR="$DEPLOY_DIR" \
    VERBOSE="$VERBOSE" \
    bash "$SCRIPTS_DIR/launch.sh" >> "$LOG_PATH" 2>&1 < /dev/null &
  exit 0
fi
