FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY utils ./utils
COPY public ./public
COPY test/stream-test-server.ts ./server.ts

RUN apk add --no-cache bash curl docker \
  && mkdir -p /usr/local/lib/docker/cli-plugins \
  && curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
    -o /usr/local/lib/docker/cli-plugins/docker-compose \
  && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose \
  && docker --version && docker compose version

RUN npm ci && npx tsc

CMD ["node", "server.js"]
