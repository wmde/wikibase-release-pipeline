#!/usr/bin/env bash
set -e

mkdir -p /opt/wbs
exec > >(tee -a /opt/wbs/deploy-setup.log) 2>&1

PUBLIC_IP=$(curl -s https://api.ipify.org)

cat > /tmp/waiting.html <<'EOF'
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
        const res = await fetch("http://$PUBLIC_IP:8888", {mode: 'no-cors'});
        location.href = "http://$PUBLIC_IP:8888";
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
(while true; do cat /tmp/waiting.html | nc -l -p 80 -q 1; done) &
WAITER_PID=$!

echo "Please go to http://$PUBLIC_IP to continue Wikibase Suite Deploy setup..."

# Background poller that exits when :8888 is available
(
  until curl -sf http://$PUBLIC_IP:8888 > /dev/null; do
    sleep 1
  done
  echo ">>> Setup page detected on port 8888, stopping temporary server..."
  kill $WAITER_PID 2>/dev/null || true
) &

echo ">>> [1/7] Installing Docker..."
curl -fsSL https://get.docker.com | sh

echo ">>> [2/7] Installing Docker Compose plugin..."
mkdir -p ~/.docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

echo ">>> [3/7] Cloning Wikibase Release Pipeline..."
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
  -v /opt/wbs/deploy-setup.log:/log/deploy-setup.log:ro \
  wbs-deploy-setup

echo ">>> [5/7] Waiting for /opt/wbs/wikibase-release-pipeline/deploy/.env..."
until [ -f /opt/wbs/wikibase-release-pipeline/deploy/.env ]; do
  sleep 2
done
echo ">>> .env file detected. Proceeding with deployment..."

echo ">>> [6/7] Launching Wikibase Suite containers..."
cd /opt/wbs/wikibase-release-pipeline/deploy
docker compose --ansi always up -d

echo ">>> [7/7] Deployment complete!"
echo "You can now shut down the installer container from the web UI at:"
echo "  http://${PUBLIC_IP}:8888"
