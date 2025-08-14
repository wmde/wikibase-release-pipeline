#!/usr/bin/env bash
set -euo pipefail

# --- Parse CLI Arguments ---

for arg in "$@"; do
  case "$arg" in
    --dev)
      SKIP_CLONE=true
      SKIP_DEPENDENCY_INSTALLS=true
      SKIP_LAUNCH=true
      # Root directory above repo. Assumes running directly in repo in deploy/setup directory
      WBS_DIR=../../..
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
    --local)
      LOCALHOST=true
      ;;
  esac
done

# --- Setup variables (including defaults) ---

REPO_URL="${REPO_URL:-https://github.com/wmde/wikibase-release-pipeline.git}"
# TODO: Change back to main branch default once released
REPO_BRANCH="${REPO_BRANCH:-deploy-setup-script}"
SKIP_CLONE="${SKIP_CLONE:-false}"
WBS_DIR="${WBS_DIR:-$HOME/wbs}"
export LOCALHOST="${LOCALHOST:-false}"
export SKIP_DEPENDENCY_INSTALLS="${SKIP_DEPENDENCY_INSTALLS:-false}"
export SKIP_LAUNCH="${SKIP_LAUNCH:-false}"
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
    # Debian / Ubuntu
    apt-get update >/dev/null 2>&1 || true
    apt-get install -y git >/dev/null 2>&1
  elif command -v dnf >/dev/null 2>&1; then
    # Fedora / RHEL 8+ / Rocky / Alma
    dnf install -y git >/dev/null 2>&1
  elif command -v yum >/dev/null 2>&1; then
    # CentOS 7 / Amazon Linux 2 / older RHEL-family (yum-based)
    # - Legacy yum path; installs Git from the default repos.
    #   On older CentOS 7 this will be an older Git version, but usually fine.
    yum install -y git >/dev/null 2>&1
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

  echo "Cloning repository to $WBS_DIR..."
  mkdir -p "$WBS_DIR"
  cd "$WBS_DIR"

  if [ ! -d wikibase-release-pipeline/.git ]; then
    git clone --branch "$REPO_BRANCH" --single-branch "$REPO_URL" >/dev/null 2>&1
  else
    echo "An existing git repository found at $WBS_DIR/wikibase-release-pipeline, using what is there ..."
  fi
  
}

# --- Execution ---

echo
echo "Wikibase Suite Deploy Setup"
echo
echo "To start we will:"
echo
echo "→ Check for Git and install if missing"
echo "→ Download the Wikibase Release Pipeline repository"
echo "→ Check for Docker and install if missing"
echo "→ Launch the web-based setup tool where you will complete configuration"
echo

if ! $SKIP_DEPENDENCY_INSTALLS; then
  install_git
fi

if ! $SKIP_CLONE; then
  clone_repo
fi

exec bash "$SCRIPTS_DIR/launch.sh" "$@"
