# Use Node Iron LTS (20): https://nodejs.org/en/blog/release/v20.9.0
FROM node:iron-bullseye

# Set the working directory
WORKDIR /workspace

# Copy package.json and package-lock.json into the container
COPY package*.json ./
RUN npm ci

# Install Docker CLI
# hadolint global ignore=DL3059
RUN curl -fsSL https://get.docker.com -o get-docker.sh | bash
RUN sh get-docker.sh
RUN npm config set loglevel error

ENTRYPOINT ["npx", "nx"]
