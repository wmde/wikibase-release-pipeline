FROM docker-registry.wikimedia.org/wikimedia-buster:latest

RUN apt-get update && \
    apt-get install --yes --no-install-recommends git ca-certificates=201* && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY ./tag_git.sh /tag_git.sh
ENTRYPOINT [ "/bin/bash", "/tag_git.sh" ]