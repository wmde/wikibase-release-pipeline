# Use Node Iron LTS (20) and Debian Bookworm LTS (12)
FROM node:20-bookworm-slim as wbs-dev-runner-base

# WBS tests use the Selenium Standalone image, so no need for the embedded Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set the working directory
WORKDIR /workspace

# hadolint global ignore=DL3059
SHELL [ "/bin/bash", "-o", "pipefail", "-c" ]

# Install necessary packages except Docker
RUN apt-get update && \
    apt-get --no-install-recommends -y install \
        python3-pip \
        python3-venv \
        curl \
        && ln -sf /usr/bin/python3 /usr/bin/python \
        && rm -rf /var/lib/apt/lists/*

# Set up Python virtual environment and install Python packages
RUN python3 -m venv /workspace/venv && \
    /workspace/venv/bin/pip install --no-cache-dir --upgrade \
        pip \
        setuptools \
        requests \
        bs4 \
        lxml \
        black

# Install Docker CLI
RUN curl -fsSL https://get.docker.com -o get-docker.sh && \
    bash get-docker.sh && \
    rm get-docker.sh

# Use the base image to install NPM dependencies
FROM wbs-dev-runner-base

# Copy package files and install NPM dependencies
COPY package*.json ./
# Add any workspace package.json files with dependencies (keep directory structure)
COPY ./test/package.json ./test/package.json
RUN npm ci && npm config set loglevel error

# Add npm bins and activate Python venv virtual environment
ENV PATH="/workspace/node_modules/.bin:/workspace/venv/bin:$PATH"

ENTRYPOINT [ "bash" ]
