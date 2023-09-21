FROM docker:latest

RUN apk add --no-cache git make bash python3 py3-pip && \
    pip3 install pyyaml

WORKDIR /app

ENV XDG_CACHE_HOME=/app/cache

RUN mkdir /home/user && chmod 777 /home/user
ENV HOME=/home/user

# TODO: https://phabricator.wikimedia.org/T347084
ADD .github/workflows/build_and_test.yml config.yml
