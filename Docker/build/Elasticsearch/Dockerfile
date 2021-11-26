ARG ELASTICSEARCH_VERSION
FROM elasticsearch:${ELASTICSEARCH_VERSION}

ARG ELASTICSEARCH_VERSION
RUN ./bin/elasticsearch-plugin install org.wikimedia.search:extra:${ELASTICSEARCH_VERSION}

ARG ELASTICSEARCH_VERSION
RUN ./bin/elasticsearch-plugin install org.wikimedia.search.highlighter:experimental-highlighter-elasticsearch-plugin:${ELASTICSEARCH_VERSION}

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"