#!/usr/bin/env bash
set -e

PUBLIC_IP=$(curl -s https://api.ipify.org)
INITIAL_SETUP_PAGE_PORT=80
SETUP_PAGE_PORT=8888

WBS_DIR="/opt/wbs"
DEPLOY_DIR="$WBS_DIR/wikibase-release-pipeline/deploy"
LOG_FILE=$WBS_DIR/deploy-setup.log

mkdir -p $WBS_DIR
exec > >(tee -a $LOG_FILE) 2>&1

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

# Start temporary HTTP server in background
cat /tmp/waiting.html | nc -l -p $INITIAL_SETUP_PAGE_PORT -q 1 &
NC_PID=$!

echo "Please go to http://$PUBLIC_IP to continue Wikibase Suite Deploy setup..."

# Background poller that exits when $SETUP_PAGE_PORT is available
(
  until curl -sf http://$PUBLIC_IP:$SETUP_PAGE_PORT > /dev/null; do
    sleep 1
  done
  echo ">>> Setup page detected on port $SETUP_PAGE_PORT, stopping temporary server..."
  kill $NC_PID 2>/dev/null || true
) &

echo ">>> [1/8] 🌐 Installing Docker..."
curl -fsSL https://get.docker.com | sh

echo ">>> [2/8] 🐳 Installing Docker Compose plugin..."
mkdir -p ~/.docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

echo "[3/8] 🌀 Enabling Docker service..."
systemctl enable --now docker

echo ">>> [4/8] 🔄 Cloning Wikibase Release Pipeline..."
cd $WBS_DIR

git clone https://github.com/wmde/wikibase-release-pipeline.git
cd wikibase-release-pipeline
# TODO: Remove once complete
git checkout cloud-config-test
cd deploy/setup

echo ">>> [5/8] 🏁 Starting setup webserver container..."
docker build -t wbs-deploy-setup .
docker run -d \
  --name wbs-deploy-setup \
  -p $SETUP_PAGE_PORT:80 \
  -v $DEPLOY_DIR:/data \
  -v $LOG_FILE:/log/deploy-setup.log:ro \
  wbs-deploy-setup

echo ">>> [6/8] 🕐 Waiting for $DEPLOY_DIR/.env..."
until [ -f $DEPLOY_DIR/.env ]; do
  sleep 2
done
echo ">>> .env file detected. Proceeding with deployment..."

echo ">>> [7/8] 🚀 Launching Wikibase Suite containers..."
cd $DEPLOY_DIR
docker compose --ansi always up -d

echo ">>> [8/8] ✅ Deployment complete!"
echo "You can now shut down the installer container from the web UI at:"
echo "  http://${PUBLIC_IP}:${SETUP_PAGE_PORT}"
