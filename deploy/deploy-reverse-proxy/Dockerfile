FROM nginx:1.25

RUN apt-get update && apt-get install -y \
    certbot \
    openssl \
    curl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
