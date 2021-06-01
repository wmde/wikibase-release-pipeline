FROM docker:latest
RUN apk add --no-cache git make bash python3 py3-pip && \
    pip3 install pyyaml
WORKDIR "/app/"
ENV XDG_CACHE_HOME=/app/cache
ADD Docker/build/ Docker/build/
ADD build/ build
ADD .github/workflows/built_and_test.yml config.yml
ADD variables.env variables.env
ADD local.env local.env
ADD Makefile Makefile
ADD update_cache.sh update_cache.sh