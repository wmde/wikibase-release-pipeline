FROM docker:latest

RUN apk add --update bash chromium chromium-chromedriver alpine-sdk python3 nodejs npm
RUN ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

WORKDIR /usr/src/app/
COPY . .
RUN if [ ! -d "/usr/src/app/node_modules" ]; then npm ci --verbose ; fi