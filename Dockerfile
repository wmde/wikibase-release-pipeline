FROM docker:latest
RUN apk add --no-cache git make bash composer

WORKDIR "/app/"
ADD Docker Docker
ADD build_scripts/ build_scripts
ADD Makefile Makefile
ADD update_cache.sh update_cache.sh