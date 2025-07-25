#!/bin/bash
set -e

# Configuration
DOMAIN=${DOMAIN:-localhost}
EMAIL=${EMAIL:-admin@example.com}
CERT_ONLY=${CERT_ONLY:-false}
CERT_DIR="/certs"
CERT_PATH="$CERT_DIR/cert.pem"
KEY_PATH="$CERT_DIR/key.pem"

mkdir -p "$CERT_DIR"

echo "🔐 Checking for existing certificate..."
if [[ -f "$CERT_PATH" && -f "$KEY_PATH" ]]; then
  echo "🔒 Existing certs found. Skipping generation."
else
  echo "📡 Starting temporary NGINX for Certbot challenge..."
  nginx &
  sleep 2

  echo "🔍 Attempting Let's Encrypt for $DOMAIN"
  if certbot certonly --webroot -w /usr/share/nginx/html -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive; then
    echo "✅ Let's Encrypt cert obtained. Linking to $CERT_DIR..."
    ln -sf "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$CERT_PATH"
    ln -sf "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$KEY_PATH"
  else
    echo "⚠️ Let's Encrypt failed. Falling back to self-signed certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout "$KEY_PATH" \
      -out "$CERT_PATH" \
      -subj "/CN=$DOMAIN"
  fi

  echo "🧹 Stopping temporary nginx..."
  nginx -s stop || true
  sleep 2
fi

if [ "$CERT_ONLY" = "true" ]; then
  echo "✅ CERT_ONLY mode complete. Certs available at:"
  ls -lh "$CERT_DIR"
  exit 0
fi

echo "🚀 Starting nginx in foreground..."
exec nginx -g 'daemon off;'
