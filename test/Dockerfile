FROM node:14.21.3-bullseye

RUN apt-get update && \
    apt-get --no-install-recommends -y install \
        docker.io=20.10.5+dfsg1-1+deb11u2 \
        chromium=116.0.5845.110-1~deb11u1 \
        python3-pip=20.3.4-4+deb11u1 && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/* && \
    pip3 install --no-cache-dir --upgrade \
        pip==23.2.1 \
        setuptools==68.1.2

WORKDIR /usr/src/app/

COPY package.json .
COPY package-lock.json .

RUN npm ci
