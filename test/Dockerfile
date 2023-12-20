FROM node:18.17.1-bullseye

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apt-get update && \
    apt-get --no-install-recommends -y install \
        docker.io \
        python3-pip \
        docker && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/* && \
    pip3 install --no-cache-dir --upgrade \
        pip \
        setuptools

WORKDIR /usr/src/test/

COPY package.json .
COPY package-lock.json .

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# hadolint global ignore=DL3059
RUN curl -fsSL https://get.docker.com -o get-docker.sh | bash
RUN sh get-docker.sh
RUN npm config set loglevel error
RUN npm ci
