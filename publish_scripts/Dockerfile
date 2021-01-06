FROM ubuntu

RUN apt-get update && \
    apt-get install --yes --no-install-recommends curl=7.* && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY publish_docker.sh /publish_docker.sh

CMD [ "/bin/bash", "/publish_docker.sh"  ]