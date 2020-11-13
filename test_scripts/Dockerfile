FROM ubuntu

RUN apt-get update && \
    apt-get install --yes --no-install-recommends curl=7.* && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY run-tests.sh /run-tests.sh

CMD [ "/bin/bash", "/run-tests.sh"  ]