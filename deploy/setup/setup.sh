#!/usr/bin/env bash
set -euo pipefail

# --- Parse CLI Arguments ---

for arg in "$@"; do
  case "$arg" in
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
    --debug)
      DEBUG=true
      ;;
    --cli)
      USE_CLI=true
      ;;
  esac
done

# --- Setup variables (including defaults) ---

REPO_URL="${REPO_URL:-https://github.com/wmde/wikibase-release-pipeline.git}"
SKIP_CLONE="${SKIP_CLONE:-false}"
WBS_DIR="${WBS_DIR:-$HOME/wbs}"
export LOCALHOST="${LOCALHOST:-false}"
export SKIP_LAUNCH="${SKIP_LAUNCH:-false}"
export SKIP_DEPENDENCY_INSTALLS="${SKIP_DEPENDENCY_INSTALLS:-false}"
export USE_CLI="${USE_CLI:-false}"
export DEBUG="${DEBUG:-false}"
export DEPLOY_DIR="${DEPLOY_DIR:-$WBS_DIR/wikibase-release-pipeline/deploy}"
export SETUP_DIR="${SETUP_DIR:-$DEPLOY_DIR/setup}"
export SCRIPTS_DIR="$SETUP_DIR/scripts"
export LOG_PATH="${LOG_PATH:-/tmp/wbs-deploy-setup.log}"

# --- Functions ---

install_git() {
  if command -v git >/dev/null 2>&1; then
    return
  fi
  echo "Installing Git..."
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update >/dev/null 2>&1 || true
    apt-get install -y git >/dev/null 2>&1
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y git >/dev/null 2>&1
  elif command -v yum >/dev/null 2>&1; then
    yum install -y git >/dev/null 2>&1
  elif command -v apk >/dev/null 2>&1; then
    apk add git >/dev/null 2>&1
  elif command -v pacman >/dev/null 2>&1; then
    pacman -Sy --noconfirm git >/dev/null 2>&1
  else
    echo "⚠️ Unsupported package manager. Please install Git manually."
    exit 1
  fi
}

clone_repo() {
  if $SKIP_CLONE; then
    echo "Skipping clone (dev mode)"
    return
  fi
  echo "Cloning repository to $WBS_DIR ..."
  mkdir -p "$WBS_DIR"
  cd "$WBS_DIR"
  if [ ! -d wikibase-release-pipeline/.git ]; then
    git clone "$REPO_URL" >/dev/null 2>&1
    # TODO: !!!! For testing, remove before delivery !!!
    cd wikibase-release-pipeline
    git checkout deploy-setup-script >/dev/null 2>&1
  else
    echo "An existing git repository found at $WBS_DIR/wikibase-release-pipeline, using what is there ..."
  fi
  
}

# --- Execution ---

echo
echo "Wikibase Suite Deploy Setup (bootstrap)"
echo

if ! $SKIP_DEPENDENCY_INSTALLS; then
  install_git
fi

if ! $SKIP_CLONE; then
  clone_repo
fi

exec bash "$SCRIPTS_DIR/launch.sh" "$@"
