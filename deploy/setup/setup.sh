#!/usr/bin/env bash
set -e

echo ">>> [1/7] Installing Docker..."
curl -fsSL https://get.docker.com | sh

echo ">>> [2/7] Installing Docker Compose plugin..."
mkdir -p ~/.docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

echo ">>> [3/7] Cloning Wikibase Release Pipeline..."
mkdir -p /opt/wbs
cd /opt/wbs
git clone https://github.com/wmde/wikibase-release-pipeline.git
cd wikibase-release-pipeline
# TODO: Remove once complete
git checkout cloud-config-test
cd deploy/setup

echo ">>> [4/7] Starting setup webserver container..."
docker build -t wbs-deploy-setup .
docker run -d \
  --name wbs-deploy-setup \
  -p 8888:80 \
  -v /opt/wbs/wikibase-release-pipeline/deploy:/data \
  -v /var/log/cloud-init-output.log:/log/cloud-init-output.log:ro \
  wbs-deploy-setup

echo ">>> [5/7] Waiting for /opt/wbs/wikibase-release-pipeline/deploy/.env..."
until [ -f /opt/wbs/wikibase-release-pipeline/deploy/.env ]; do
  sleep 2
done
echo ">>> .env file detected. Proceeding with deployment..."

echo ">>> [6/7] Launching Wikibase Suite containers..."
cd /opt/wbs/wikibase-release-pipeline/deploy
docker compose up -d

echo ">>> [7/7] Deployment complete!"
echo "You can now shut down the installer container from the web UI at:"
PUBLIC_IP=$(curl -s https://api.ipify.org)
echo "  http://${PUBLIC_IP}:8888"
