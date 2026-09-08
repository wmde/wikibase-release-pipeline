ARG QLEVER_IMAGE_URL
FROM ${QLEVER_IMAGE_URL}

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-suite"

USER root
COPY runtime/ /
RUN chmod 755 /usr/local/bin/wbs-qlever && \
  mkdir -p /data && \
  chown qlever:qlever /data

WORKDIR /data
USER qlever
ENTRYPOINT ["/usr/local/bin/wbs-qlever"]
CMD ["server"]
