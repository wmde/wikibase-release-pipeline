#!/usr/bin/env bash
set -e

# Constants
WBS_DIR="/opt/wbs"
REPO_URL="https://github.com/wmde/wikibase-release-pipeline.git"
DEPLOY_DIR="$WBS_DIR/wikibase-release-pipeline/deploy"
LOG_FILE="$WBS_DIR/deploy-setup.log"
INITIAL_SETUP_PAGE_PORT=80
SETUP_PAGE_PORT=8888

# Get public IP
PUBLIC_IP=$(curl -s https://api.ipify.org)

# Setup logging
mkdir -p "$WBS_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

# --- Functions ---

start_waiting_page() {
  cat > /tmp/waiting.html <<EOF
HTTP/1.1 200 OK

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Preparing Installer...</title>
  <style>
    body { font-family: sans-serif; text-align: center; margin-top: 20vh; }
  </style>
</head>
<body>
  <h1>Preparing setup...</h1>
  <p>This page will redirect to the installer once it's ready.</p>
  <script>
    async function check() {
      try {
        const res = await fetch("http://$PUBLIC_IP:$SETUP_PAGE_PORT", {mode: 'no-cors'});
        location.href = "http://$PUBLIC_IP:$SETUP_PAGE_PORT";
      } catch (e) {
        setTimeout(check, 2000);
      }
    }
    check();
  </script>
</body>
</html>
EOF

  cat /tmp/waiting.html | nc -l -p $INITIAL_SETUP_PAGE_PORT -q 1 &
  NC_PID=$!

  echo "Open http://$PUBLIC_IP to begin Wikibase Suite Deploy setup..."

  (
    until curl -sf "http://$PUBLIC_IP:$SETUP_PAGE_PORT" > /dev/null; do
      sleep 1
    done
    echo "Setup page detected on port $SETUP_PAGE_PORT, stopping temporary server..."
    kill $NC_PID 2>/dev/null || true
  ) &
}

setup_docker() {
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh

  echo "Enabling and starting Docker service..."
  systemctl enable --now docker
}

install_docker_compose() {
  echo "Installing Docker Compose plugin..."
  mkdir -p ~/.docker/cli-plugins
  curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o ~/.docker/cli-plugins/docker-compose
  chmod +x ~/.docker/cli-plugins/docker-compose
}

clone_release_pipeline() {
  echo "Cloning Wikibase Release Pipeline repository..."
  cd "$WBS_DIR"
  git clone "$REPO_URL"
  cd wikibase-release-pipeline
  git checkout cloud-config-test  # TODO: Remove once stable
}

start_setup_wizard_container() {
  echo "Starting setup webserver container..."
  cd "$DEPLOY_DIR/setup"

  # Generate self-signed SSL certs
  mkdir -p "certs"
  docker run --rm -v "$DEPLOY_DIR/setup/certs:/certs" stakater/ssl-certs-generator:1.0

  docker build -t deploy-setup-wizard .
  docker run -d \
    --name deploy-setup-wizard \
    -p $SETUP_PAGE_PORT:443 \
    -v "$DEPLOY_DIR:/data" \
    -v "$DEPLOY_DIR/setup/certs:/certs" \
    -v "$LOG_FILE:/log/deploy-setup.log:ro" \
    deploy-setup-wizard
}

wait_for_env_file() {
  echo "Waiting for $DEPLOY_DIR/.env to be created..."
  until [ -f "$DEPLOY_DIR/.env" ]; do
    sleep 2
  done
  echo ".env file detected. Proceeding with deployment..."
}

launch_wikibase() {
  echo "Launching Wikibase Suite containers..."
  cd "$DEPLOY_DIR"
  docker compose --ansi always up -d
}

final_message() {
  echo "Deployment complete!"
  echo "You can now shut down the installer container from the web UI at:"
  echo "  http://$PUBLIC_IP:$SETUP_PAGE_PORT"
}

# --- Execution ---

start_waiting_page
setup_docker
install_docker_compose
clone_release_pipeline
start_setup_wizard_container
wait_for_env_file
launch_wikibase
final_message
