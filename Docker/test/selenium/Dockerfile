FROM docker:20.10.11-alpine3.14

RUN apk add --update bash chromium chromium-chromedriver alpine-sdk python3 nodejs npm && \
    ln -sf python3 /usr/bin/python && \
    python3 -m ensurepip && \
    pip3 install --no-cache --upgrade pip setuptools

WORKDIR /usr/src/app/
COPY . .

# if installed locally these files are copied to make this go a bit quicker
# set this variable in local.env to something to use it
ARG SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES
RUN if [ -z ${SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES} ]; then npm ci ; fi