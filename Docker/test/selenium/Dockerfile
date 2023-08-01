FROM node:14.21.3-bullseye

RUN apt-get update && \
    apt-get -y install docker.io chromium python3-pip && \
    ln -sf /usr/bin/python3 /usr/bin/python && \
    rm -rf /var/lib/apt/lists/* && \
    pip3 install --no-cache --upgrade pip setuptools

WORKDIR /usr/src/app/
COPY . .

# if installed locally these files are copied to make this go a bit quicker
# set this variable in local.env to something to use it
ARG SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES
RUN if [ -z ${SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES} ]; then npm ci ; fi
