# Base image: Node.js LTS (24) on Debian Bookworm (12)
FROM node:24-bookworm-slim AS wbs-dev

# WBS tests use the Selenium Standalone image, so no need for the embedded Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# hadolint global ignore=DL3059
SHELL [ "/bin/bash", "-o", "pipefail", "-c" ]

# Install necessary packages except Docker and PNPM
RUN apt-get update && \
    apt-get --no-install-recommends -y install \
        git \
        curl \
        jq \
        python3-pip \
        python3-venv \
        && ln -sf /usr/bin/python3 /usr/bin/python \
        && rm -rf /var/lib/apt/lists/*

# Install Docker CLI
RUN curl -fsSL https://get.docker.com -o get-docker.sh && \
    bash get-docker.sh && \
    rm get-docker.sh

# Install hadolint Dockerfile linter (supports both AMD64 and ARM64)
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        curl -L https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64 -o /usr/local/bin/hadolint; \
    elif [ "$ARCH" = "aarch64" ]; then \
        curl -L https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-arm64 -o /usr/local/bin/hadolint; \
    fi && \
    chmod +x /usr/local/bin/hadolint

# Set up Python virtual environment for Python formatting
RUN python3 -m venv /root/venv && \
    /root/venv/bin/pip install --no-cache-dir --upgrade \
        pip \
        setuptools \
        black

WORKDIR /workspace/development

# Setup Git
RUN git config --global --add safe.directory /workspace

# Install pnpm through the package-manager shim bundled with Node.js.
RUN corepack enable && corepack prepare pnpm@11.20.0 --activate

# Add npm module bins and activate Python venv virtual environment
ENV PATH="/workspace/development/node_modules/.bin:/root/venv/bin:$PATH"

ENTRYPOINT [ "./lib/container-entrypoint.sh" ]
