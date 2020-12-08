FROM ubuntu

RUN apt-get update && \
    apt-get install --yes --no-install-recommends curl=7.* && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY test_curl.sh /test_curl.sh

CMD [ "/bin/bash", "/test_curl.sh"  ]