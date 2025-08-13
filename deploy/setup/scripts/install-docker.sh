#!/usr/bin/env bash
set -euo pipefail

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"

debug "Checking for Docker..."

if command -v docker >/dev/null 2>&1; then
  status "Docker already installed."
  exit 0
fi

debug "Installing Docker..."

# Resolve OS fields once to avoid unbound var issues under set -u
if [ -r /etc/os-release ]; then
  # shellcheck disable=SC1091
  . /etc/os-release
fi
OS_ID="${ID:-debian}"
CODENAME="$(lsb_release -cs 2>/dev/null || echo stable)"

if command -v apt-get >/dev/null 2>&1; then
  run "sudo apt-get update -y"
  run "sudo apt-get install -y ca-certificates curl gnupg lsb-release"
  run "sudo install -m 0755 -d /etc/apt/keyrings"
  run "curl -fsSL https://download.docker.com/linux/${OS_ID}/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg"
  run "sh -c 'echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${OS_ID} ${CODENAME} stable\" > /etc/apt/sources.list.d/docker.list'"
  run "sudo apt-get update -y"
  run "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"

elif command -v dnf >/dev/null 2>&1; then
  run "sudo dnf -y install dnf-plugins-core"
  run "sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo"
  run "sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"

elif command -v yum >/dev/null 2>&1; then
  run "sudo yum install -y yum-utils"
  run "sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo"
  run "sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"

elif command -v apk >/dev/null 2>&1; then
  run "sudo apk add --no-cache docker docker-cli-compose"

elif command -v pacman >/dev/null 2>&1; then
  run "sudo pacman -Sy --noconfirm docker docker-compose"

else
  status "⚠️ Unsupported package manager. Please install Docker manually."
  exit 1
fi

debug "Enabling and starting Docker..."
run "sudo systemctl enable docker"
run "sudo systemctl start docker"
status "Docker installation complete."
