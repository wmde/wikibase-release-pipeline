FROM docker:latest

#RUN apt-get update && \
#    apt-get install --yes --no-install-recommends curl=7.* && \
#    apt-get clean && rm -rf /var/lib/apt/lists/*

#RUN apt-get update && apt-get install --yes git make
RUN apk add --no-cache git make bash

WORKDIR "/app/"
ADD Docker Docker
ADD build_scripts/ build_scripts
ADD Makefile Makefile
ADD .env .env
ADD update_cache.sh update_cache.sh

#CMD [ "/bin/bash", "/app/build_scripts/build_wikibase.sh"  ]