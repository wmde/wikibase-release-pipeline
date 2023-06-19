ARG ELASTICSEARCH_VERSION
FROM bitnami/elasticsearch:${ELASTICSEARCH_VERSION}

WORKDIR /opt/bitnami/elasticsearch

ARG ELASTICSEARCH_PLUGIN_EXTRA_VERSION
RUN ./bin/elasticsearch-plugin install org.wikimedia.search:extra:${ELASTICSEARCH_PLUGIN_EXTRA_VERSION}

ARG ELASTICSEARCH_VERSION
RUN ./bin/elasticsearch-plugin install org.wikimedia.search.highlighter:experimental-highlighter-elasticsearch-plugin:${ELASTICSEARCH_VERSION}

COPY default.jvm.options ./config/default.jvm.options
RUN cat ./config/default.jvm.options >> ./config/jvm.options && rm ./config/default.jvm.options

WORKDIR /

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"