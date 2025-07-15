#!/usr/bin/env bash
set -euo pipefail

CERT_DIR="./certs"
CERT_PATH="$CERT_DIR/cert.pem"
KEY_PATH="$CERT_DIR/key.pem"
DOMAINS=("localhost" "127.0.0.1" "::1")

mkdir -p "$CERT_DIR"

if ! command -v mkcert &> /dev/null; then
  echo "❌ mkcert is not installed."

  echo ""
  echo "👉 Please install mkcert manually:"
  echo ""
  echo "macOS:"
  echo "  brew install mkcert nss"
  echo ""
  echo "Debian/Ubuntu:"
  echo "  sudo apt install libnss3-tools"
  echo "  curl -Lo mkcert https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-$(uname -s)-amd64"
  echo "  chmod +x mkcert && sudo mv mkcert /usr/local/bin/"
  echo ""
  echo "Fedora:"
  echo "  sudo dnf install nss-tools"
  echo ""
  echo "Windows (Git Bash / WSL):"
  echo "  Download from https://github.com/FiloSottile/mkcert/releases and add to PATH"
  echo ""
  exit 1
fi

echo "✅ mkcert is installed: $(mkcert -version)"

echo "📥 Ensuring local root CA is installed..."
mkcert -install

echo "🔐 Generating cert for: ${DOMAINS[*]}"
mkcert -cert-file "$CERT_PATH" -key-file "$KEY_PATH" "${DOMAINS[@]}"

echo "✅ Certificate created at:"
echo "  - $CERT_PATH"
echo "  - $KEY_PATH"
