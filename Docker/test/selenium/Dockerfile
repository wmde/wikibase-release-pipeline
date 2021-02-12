FROM docker:latest

RUN apk add --update bash chromium chromium-chromedriver alpine-sdk python3 nodejs npm
RUN ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

WORKDIR /usr/src/app/
COPY . .

# if installed locally these files are copied to make this go a bit quicker
# set this variable in local.env to something to use it
ARG SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES
RUN if [ -z ${SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES} ]; then npm ci --verbose ; fi