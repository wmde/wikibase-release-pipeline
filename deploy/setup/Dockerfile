FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY server.js ./
COPY public ./public

EXPOSE 80
CMD ["node", "server.js"]
