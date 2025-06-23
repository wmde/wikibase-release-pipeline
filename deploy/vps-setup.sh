#!/usr/bin/env bash
set -e

WBS_DIR="/opt/wbs"

echo "Creating bootstrap status directory..."
mkdir -p "$WBS_DIR/bootstrap-status"

# 1) Detect public IP
echo "Detecting public IP..."
PUBLIC_IP=$(curl -s https://api.ipify.org)
echo "Detected public IP: $PUBLIC_IP"

# 2) Generate secure random passwords
echo "Generating passwords..."
MW_ADMIN_PASS=$(openssl rand -base64 16)
DB_PASS=$(openssl rand -base64 16)

# 3) Create live log HTML page
cat <<EOF > "$WBS_DIR/bootstrap-status/index.html"
<!DOCTYPE html>
<html>
  <head>
    <title>Wikibase Suite Installer Log</title>
    <meta http-equiv="refresh" content="5">
    <style>
      body { font-family: monospace; white-space: pre; background: #111; color: #eee; padding: 1em; }
    </style>
  </head>
  <body>
    Loading installer log...
  </body>
</html>
EOF

# 4) Start a background log tailer
(
  while true; do
    {
      echo "<!DOCTYPE html><html><head><title>Installer Log</title><meta http-equiv=\"refresh\" content=\"5\"><style>body { font-family: monospace; white-space: pre; background: #111; color: #eee; padding: 1em; }</style></head><body>"
      tail -n 50 /var/log/cloud-init-output.log | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g'
      echo "</body></html>"
    } > "$WBS_DIR/bootstrap-status/index.html"
    sleep 2
  done
) &
TAIL_PID=$!

# 5) Install Docker and Compose
echo "Installing Docker..."
curl -fsSL https://get.docker.com | sh

echo "Installing Docker Compose plugin..."
mkdir -p ~/.docker/cli-plugins/
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

echo "Enabling Docker..."
sudo systemctl enable --now docker

# 6) Start provisional nginx on port 8888
echo "Starting provisional nginx container on port 8888..."
docker run -d \
  --name wbs-bootstrap-nginx \
  -p 8888:80 \
  -v "$WBS_DIR/bootstrap-status":/usr/share/nginx/html:ro \
  nginx:alpine

# 7) Clone the Wikibase repo
echo "Cloning Wikibase release pipeline..."
git clone https://github.com/wmde/wikibase-release-pipeline.git "$WBS_DIR/wikibase-release-pipeline"

# 8) Write the .env file directly with full block comments and dynamic values
cat <<EOF > "$WBS_DIR/wikibase-release-pipeline/deploy/.env"
# ##############################################################################
# Wikibase Suite Deploy - initial configuration
#
# This file is auto-generated during server bootstrap.
# It is used by the docker-compose setup for Wikibase Suite.
#
# WARNING: Do not add comments on the same line as env vars!
# ##############################################################################

# Public hostname configuration.
# These domain names should point to your VPS public IP.
# Using traefik.me for quick testing — change in production.
WIKIBASE_PUBLIC_HOST=${PUBLIC_IP}.traefik.me
WDQS_PUBLIC_HOST=query.${PUBLIC_IP}.traefik.me

# MediaWiki / Wikibase admin user configuration.
MW_ADMIN_NAME=admin
MW_ADMIN_EMAIL=admin@wikibase.example
MW_ADMIN_PASS=${MW_ADMIN_PASS}

# MediaWiki / Wikibase database configuration.
DB_NAME=my_wiki
DB_USER=sqluser
DB_PASS=${DB_PASS}
EOF

echo ".env created at $WBS_DIR/wikibase-release-pipeline/deploy/.env:"
cat "$WBS_DIR/wikibase-release-pipeline/deploy/.env"

# 10) Bring up Wikibase Suite
echo "Bringing up Wikibase Suite..."
cd "$WBS_DIR/wikibase-release-pipeline/deploy"
docker compose up -d

echo "Deployment complete!"
echo "Admin Password: ${MW_ADMIN_PASS}"
echo "DB Password: ${DB_PASS}"
echo "Your Wikibase Suite should now be accessible at:"
echo "  https://${PUBLIC_IP}.traefik.me"
echo "  https://query.${PUBLIC_IP}.traefik.me"

# 9) Stop bootstrap nginx + log tailer
# echo "Stopping provisional nginx and log tailer..."
# docker stop wbs-bootstrap-nginx && docker rm wbs-bootstrap-nginx
# kill $TAIL_PID || true

