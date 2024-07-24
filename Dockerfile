# Use Node Iron LTS (20): https://nodejs.org/en/blog/release/v20.9.0
FROM node:iron-bullseye as wbs-dev-base

# Set environment variable to skip Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set the working directory
WORKDIR /workspace

# hadolint global ignore=DL3059
SHELL [ "/bin/bash", "-o", "pipefail", "-c" ]

# Install necessary packages except Docker
RUN apt-get update && \
    apt-get --no-install-recommends -y install \
        python3-pip \
        && ln -sf /usr/bin/python3 /usr/bin/python \
        && rm -rf /var/lib/apt/lists/* \
        && pip3 install --no-cache-dir --upgrade \
            pip \
            setuptools \
            requests \
            bs4 \
            lxml \
            black
    
# Install Docker CLI
RUN curl -fsSL https://get.docker.com -o get-docker.sh | bash
RUN sh get-docker.sh

FROM wbs-dev-base
# Install NPM dependencies
# * if adding dependencies run `npm install` from a local node installation
COPY package*.json ./
RUN npm ci && npm config set loglevel error

# Set entry point
ENTRYPOINT [ "bash" ]
