#!/usr/bin/env bash
set -euo pipefail

# shellcheck disable=SC1091
source "$SCRIPTS_DIR/_logging.sh"

debug "Checking for Docker..."

if command -v docker >/dev/null 2>&1; then
  status "Docker already installed."
  exit 0
fi

debug "Installing Docker (using distro packages)..."

if command -v apt-get >/dev/null 2>&1; then
  # Debian/Ubuntu: use distro packages
  run "sudo apt-get update -y"
  run "sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-buildx-plugin docker-compose-plugin"
elif command -v dnf >/dev/null 2>&1; then
  # Fedora: use Fedora-maintained Moby packages (works on newer and older supported Fedoras)
  run "sudo dnf -y install moby-engine moby-cli docker-compose-plugin docker-buildx-plugin"
elif command -v yum >/dev/null 2>&1; then
  # CentOS / RHEL / Amazon Linux 2
  run "sudo yum install -y yum-utils"
  run "sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo"
  run "sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"
else
  status "⚠️ Unsupported package manager. Please install Docker manually."
  exit 1
fi

debug "Enabling and starting Docker..."
run "sudo systemctl enable --now docker"
status "Docker installation complete."
