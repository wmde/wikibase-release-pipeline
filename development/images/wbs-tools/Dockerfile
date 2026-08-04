FROM node:20-alpine

ARG WBS_TOOLS_VERSION
LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"
LABEL org.opencontainers.image.version="${WBS_TOOLS_VERSION}"

WORKDIR /app

COPY package.json package-lock.json tsconfig.json tsconfig.server.json ./
COPY cli ./cli
COPY shared ./shared
COPY web ./web
COPY wbs.ts ./wbs.ts

RUN apk add --no-cache bash docker-cli docker-cli-compose git openssl curl
RUN npm ci && npm run build

CMD ["node", "dist/web/server.js"]
