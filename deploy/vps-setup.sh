#!/usr/bin/env bash
set -euo pipefail

echo "=== Installing Docker ==="
curl -fsSL https://get.docker.com | sh

echo "=== Installing Docker Compose plugin ==="
mkdir -p ~/.docker/cli-plugins/
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

echo "=== Enabling Docker ==="
sudo systemctl enable --now docker

echo "=== Cloning Wikibase release pipeline ==="
git clone https://github.com/wmde/wikibase-release-pipeline.git /opt/wikibase

echo "=== Fetching public IP ==="
PUBLIC_IP=$(curl -s https://api.ipify.org)
echo "Detected public IP: $PUBLIC_IP"

echo "=== Generating secure random passwords ==="
MW_ADMIN_PASS=$(openssl rand -base64 16)
DB_PASS=$(openssl rand -base64 16)

echo "=== Creating .env file in /opt/wikibase/deploy ==="
cat <<EOF > /opt/wikibase/deploy/.env
# Public hostname configuration.
WIKIBASE_PUBLIC_HOST=${PUBLIC_IP}.traefik.me
WDQS_PUBLIC_HOST=query.${PUBLIC_IP}.traefik.me

# MediaWiki / Wikibase user configuration.
MW_ADMIN_NAME=admin
MW_ADMIN_EMAIL=admin@wikibase.example
MW_ADMIN_PASS=${MW_ADMIN_PASS}

# MediaWiki / Wikibase database configuration.
DB_NAME=my_wiki
DB_USER=sqluser
DB_PASS=${DB_PASS}
EOF

echo "=== .env file created ==="
cat /opt/wikibase/deploy/.env

echo "=== Starting Wikibase stack with Docker Compose ==="
cd /opt/wikibase/deploy
docker compose up -d

echo "=== Deployment complete ==="
echo "Public host: ${PUBLIC_IP}.traefik.me"
echo "Admin password: ${MW_ADMIN_PASS}"
echo "Database password: ${DB_PASS}"
