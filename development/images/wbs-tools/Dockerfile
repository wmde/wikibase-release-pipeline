FROM node:20-alpine

ARG WBS_TOOLS_VERSION
LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"
LABEL org.opencontainers.image.version="${WBS_TOOLS_VERSION}"

WORKDIR /app

COPY app/package.json app/package-lock.json app/tsconfig.json app/tsconfig.server.json app/vite.config.ts app/index.html ./
COPY app/client ./client
COPY app/public ./public
COPY app/shared ./shared
COPY app/data ./data
COPY app/cli.ts ./cli.ts
COPY app/server.ts ./server.ts
COPY app/logStreamer.ts ./logStreamer.ts
COPY app/passwordPolicy.ts ./passwordPolicy.ts
COPY app/serverHelpers.ts ./serverHelpers.ts

RUN apk add --no-cache bash
RUN npm ci && npm run build

CMD ["node", "dist/server.js"]
