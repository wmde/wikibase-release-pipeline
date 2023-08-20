FROM node:14.21.3-bullseye

RUN apt-get update && \
    apt-get -y install docker.io chromium python3-pip && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/* && \
    pip3 install --no-cache --upgrade pip setuptools

WORKDIR /usr/src/app/

COPY package.json .
COPY package-lock.json .
RUN npm ci
