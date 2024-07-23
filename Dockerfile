# hadolint global ignore=DL3059

# Use Node Iron LTS (20): https://nodejs.org/en/blog/release/v20.9.0
FROM node:iron-bullseye

SHELL [ "/bin/bash", "-o", "pipefail", "-c" ]

# Set the working directory
WORKDIR /workspace

# Copy package.json and pnpm-lock.yaml into the container

# Install PNPM

RUN corepack enable
ENV PNPM_HOME="/workspace/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
# RUN corepack enable pnpm && corepack use pnpm@latest && pnpm config set store-dir /workspace/pnpm/store --global && pnpm install

# Install Docker CLI
RUN curl -fsSL https://get.docker.com -o get-docker.sh | bash
RUN sh get-docker.sh

# Install Python and PIP packages
RUN apt-get update && \
    apt-get --no-install-recommends -y install python3-pip && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/* && \
    pip3 install --no-cache-dir --upgrade \
        pip \
        setuptools \
        requests \
        bs4 \
        lxml \
        black

COPY entrypoint.sh ./

ENTRYPOINT ["./entrypoint.sh"]
