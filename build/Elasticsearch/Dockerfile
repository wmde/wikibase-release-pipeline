ARG ELASTICSEARCH_IMAGE_URL

# ###########################################################################
# hadolint ignore=DL3006
FROM ${ELASTICSEARCH_IMAGE_URL}
LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"
ARG ELASTICSEARCH_PLUGIN_WIKIMEDIA_EXTRA
ARG ELASTICSEARCH_PLUGIN_WIKIMEDIA_HIGHLIGHTER

RUN \
  ./bin/elasticsearch-plugin install \
    org.wikimedia.search:extra:${ELASTICSEARCH_PLUGIN_WIKIMEDIA_EXTRA} && \
  ./bin/elasticsearch-plugin install \
    org.wikimedia.search.highlighter:experimental-highlighter-elasticsearch-plugin:${ELASTICSEARCH_PLUGIN_WIKIMEDIA_HIGHLIGHTER}
COPY default.jvm.options /default.jvm.options
RUN cat /default.jvm.options >> /usr/share/elasticsearch/config/jvm.options && \
    rm /default.jvm.options

