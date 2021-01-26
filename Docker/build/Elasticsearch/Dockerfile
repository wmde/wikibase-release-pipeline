ARG ELASTICSEARCH_VERSION
FROM elasticsearch:${ELASTICSEARCH_VERSION}
RUN ./bin/elasticsearch-plugin install org.wikimedia.search:extra:${ELASTICSEARCH_VERSION}
RUN ./bin/elasticsearch-plugin install org.wikimedia.search.highlighter:experimental-highlighter-elasticsearch-plugin:${ELASTICSEARCH_VERSION}