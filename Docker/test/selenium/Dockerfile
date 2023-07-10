FROM docker:20.10.11-alpine3.14

RUN apk add --update bash chromium chromium-chromedriver alpine-sdk python3 nodejs npm && \
    ln -sf python3 /usr/bin/python && \
    python3 -m ensurepip && \
    pip3 install --no-cache --upgrade pip setuptools

WORKDIR /usr/src/app/

COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .
