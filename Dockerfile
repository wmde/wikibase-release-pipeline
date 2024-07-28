# Base image: Node.js LTS (20) on Debian Bookworm (12)
FROM node:20-bookworm-slim AS wbs-dev-runner-base

# WBS tests use the Selenium Standalone image, so no need for the embedded Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /workspace

# hadolint global ignore=DL3059
SHELL [ "/bin/bash", "-o", "pipefail", "-c" ]

# Install necessary packages except Docker
RUN apt-get update && \
    apt-get --no-install-recommends -y install \
        curl \
        python3-pip \
        python3-venv \
        && ln -sf /usr/bin/python3 /usr/bin/python \
        && rm -rf /var/lib/apt/lists/*

# Set up Python virtual environment and install Python packages
RUN python3 -m venv /root/venv && \
    /root/venv/bin/pip install --no-cache-dir --upgrade \
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

# Stage to get the hadolint binary
FROM ghcr.io/hadolint/hadolint:latest-debian AS hadolint

# Final stage: Build on top of the base image
FROM wbs-dev-runner-base

# Copy the Dockerfile linter hadolint binary from the hadolint image
COPY --from=hadolint /bin/hadolint /usr/local/bin/hadolint

# NPM dependencies
COPY package*.json ./
# Add any workspace package.json files with dependencies (keep directory structure)
COPY ./test/package.json ./test/package.json
RUN npm ci && npm config set loglevel error

# Add npm bins and activate Python venv virtual environment
ENV PATH="/workspace/node_modules/.bin:/root/venv/bin:$PATH"

ENTRYPOINT [ "bash" ]
