#!/usr/bin/env bash
set -e

WBS_DIR="/opt/wbs"

# 1) Create status page folder & placeholder index.html
mkdir -p "$WBS_DIR/bootstrap-status"
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

# 2) Start a background log tailer to keep rewriting index.html
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

# 3) Install Docker & Compose
echo "Installing Docker..."
curl -fsSL https://get.docker.com | sh

echo "Installing Docker Compose plugin..."
mkdir -p ~/.docker/cli-plugins/
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

echo "Enabling Docker..."
sudo systemctl enable --now docker

# 4) Start provisional nginx container on port 8888, mounting status folder
echo "Starting provisional nginx container on port 8888..."
docker run -d \
  --name wbs-bootstrap-nginx \
  -p 8888:80 \
  -v "$WBS_DIR/bootstrap-status":/usr/share/nginx/html:ro \
  nginx:alpine

# 5) Clone the Wikibase repo
echo "Cloning Wikibase release pipeline..."
git clone https://github.com/wmde/wikibase-release-pipeline.git "$WBS_DIR/wikibase-release-pipeline"

# 6) Bring up Wikibase stack
echo "Starting Wikibase stack..."
cd "$WBS_DIR/wikibase-release-pipeline/deploy"
docker compose up -d

# 7) Shutdown temp nginx and tailer after main stack is up
echo "Shutting down provisional nginx and log tailer..."
docker stop wbs-bootstrap-nginx && docker rm wbs-bootstrap-nginx
kill $TAIL_PID || true

echo "All done. Wikibase Suite is up. Visit your final domain."
