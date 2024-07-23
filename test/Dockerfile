# hadolint global ignore=DL3059

# Use Node Iron LTS (20): https://nodejs.org/en/blog/release/v20.9.0
FROM node:iron-bullseye
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /usr/src/test/

# Copy package.json and pnpm-lock.yaml into the container
COPY package.json ./
COPY pnpm-lock.yaml ./

SHELL [ "/bin/bash", "-o", "pipefail", "-c" ]

# Install PNPM (caching results)
RUN corepack enable
RUN pnpm install --frozen-lockfile

# Install Docker CLI
RUN curl -fsSL https://get.docker.com -o get-docker.sh | bash
RUN sh get-docker.sh

# Install remaining tooling
RUN apt-get update && \
    apt-get --no-install-recommends -y install \
        docker.io \
        python3-pip \
        docker && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/* && \
    pip3 install --no-cache-dir --upgrade \
        pip \
        setuptools \
        requests \
        bs4 \
        lxml \
        black
