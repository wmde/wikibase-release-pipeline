ARG ELASTICSEARCH_VERSION
FROM elasticsearch:${ELASTICSEARCH_VERSION}

ARG ELASTICSEARCH_PLUGIN_EXTRA_VERSION
RUN ./bin/elasticsearch-plugin install org.wikimedia.search:extra:${ELASTICSEARCH_PLUGIN_EXTRA_VERSION}

ARG ELASTICSEARCH_VERSION
RUN ./bin/elasticsearch-plugin install org.wikimedia.search.highlighter:experimental-highlighter-elasticsearch-plugin:${ELASTICSEARCH_VERSION}

COPY default.jvm.options /default.jvm.options
RUN cat /default.jvm.options >> /usr/share/elasticsearch/config/jvm.options && rm /default.jvm.options

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"