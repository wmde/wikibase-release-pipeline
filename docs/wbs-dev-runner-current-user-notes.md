# Notes on Running wbs-dev-runner as current user

A work in progress: I had it mostly working as is, but thought it was unnecessarily complex. The Docker engine I use is using my user for things somehow, so the issue of files created with "root" hasn't came-up for me, but this may be something that needs addressing for other dev teams users. 

./nx script:

```bash
...
docker compose --progress quiet build --build-arg UID="$(id -u)" --build-arg GID="$(id -g)"
exec docker compose --progress quiet run --build --rm runner -c "nx ${*}"
```

./Dockerfile:

```Dockerfile
# Base image: Node.js LTS (20) on Debian Bookworm (12)
FROM node:20-bookworm-slim AS wbs-dev-runner-base

# WBS tests use the Selenium Standalone image, so no need for the embedded Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /workspace

USER root

# hadolint global ignore=DL3059
SHELL [ "/bin/bash", "-o", "pipefail", "-c" ]

# Install necessary packages except Docker
RUN apt-get update && \
    apt-get --no-install-recommends -y install \
        curl \
        && rm -rf /var/lib/apt/lists/*

# Install Docker CLI
RUN curl -fsSL https://get.docker.com -o get-docker.sh && \
    bash get-docker.sh && \
    rm get-docker.sh

# Create and switch to host user id and group id
ARG UID
ARG GID
RUN if [ -z "$UID" ] || [ -z "$GID" ]; then \
        echo "Error: UID and GID must be provided as build arguments." >&2; \
        exit 1; \
    fi
RUN set -ex; \
    # Create the group with the specified GID if it doesn't exist
    if ! getent group "$GID" > /dev/null; then \
    groupadd -g "$GID" node; \
    fi; \
    # Update the user's GID and UID
    usermod -g "$GID" node; \
    usermod -u "$UID" node

USER node

# Install PNPM
RUN mkdir ~/.npm-global && npm config set prefix ~/.npm-global && npm install -g pnpm@9.6.0
ENV PATH=~/.npm-global/bin:$PATH

USER root

# Stage to get the hadolint binary (which will be plaform sensitive)
FROM ghcr.io/hadolint/hadolint:latest-debian AS hadolint

# Final stage: Build on top of the base image
FROM wbs-dev-runner-base

# Copy the Dockerfile linter hadolint binary from the hadolint image
COPY --from=hadolint /bin/hadolint /usr/local/bin/hadolint

USER node

# Add npm bins and activate Python venv virtual environment
ENV PATH="/workspace/node_modules/.bin:~/venv/bin:$PATH"

ENTRYPOINT [ "./entrypoint.sh" ]
```
