FROM docker:latest
RUN apk add --no-cache git make bash

WORKDIR "/app/"
ADD Docker Docker
ADD build_scripts/ build_scripts
ADD Makefile Makefile

ARG RELEASE_ENV_FILE
ADD ${RELEASE_ENV_FILE} .env

ADD update_cache.sh update_cache.sh