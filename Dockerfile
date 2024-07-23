# Use Node Iron LTS (20): https://nodejs.org/en/blog/release/v20.9.0
FROM node:iron-bullseye

# Set environment variable to skip Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set the working directory
WORKDIR /workspace

# Copy package.json and package-lock.json into the container
COPY package*.json ./

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
            black \
        && npm ci \
        && npm config set loglevel error

# Install Docker CLI
RUN curl -fsSL https://get.docker.com -o get-docker.sh | bash
RUN sh get-docker.sh
RUN npm config set loglevel error

# Set entry point
ENTRYPOINT ["bash"]
