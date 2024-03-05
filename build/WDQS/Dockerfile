ARG DEBIAN_IMAGE_URL
ARG JDK_IMAGE_URL

# ###########################################################################
# hadolint ignore=DL3006
FROM ${DEBIAN_IMAGE_URL} as fetcher
ARG WDQS_VERSION

RUN apt-get update && \
    apt-get install --yes --no-install-recommends wget ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

SHELL ["/bin/bash", "-euo", "pipefail", "-c"]
RUN set -x; \
    TARBALL="service-${WDQS_VERSION}-dist.tar.gz"; \
    wget --no-verbose "https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$WDQS_VERSION/$TARBALL"; \
    SIGNATURE="$TARBALL".md5; \
    wget --no-verbose "https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$WDQS_VERSION/$SIGNATURE"; \
    echo "$(cat $SIGNATURE)  $TARBALL" | md5sum -c; \
    mkdir /tmp/wdqs-service; \
    tar zxvf $TARBALL -C /tmp/wdqs-service --strip-components=1

# ###########################################################################
# hadolint ignore=DL3006
FROM ${JDK_IMAGE_URL}
LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"

# Blazegraph scripts require bash
# Install curl for the loadData.sh wdqs script (if someone needs it)
RUN apt-get update && \
    apt-get install --yes --no-install-recommends bash gettext curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    \
    addgroup --system blazegraph && \
    adduser --system \
        --gid $(getent group blazegraph | cut -d: -f3) \
        --shell /bin/bash blazegraph

COPY --from=fetcher --chown=blazegraph:blazegraph /tmp/wdqs-service /wdqs

RUN mkdir /var/log/wdqs && chown blazegraph /var/log/wdqs

# Don't set a memory limit otherwise bad things happen (OOMs)
ENV MEMORY=""\
    HEAP_SIZE="1g"\
    HOST="0.0.0.0"\
    WDQS_ENTITY_NAMESPACES="120,122"\
    WIKIBASE_SCHEME="http"\
    WIKIBASE_MAX_DAYS_BACK="90"\
    BLAZEGRAPH_EXTRA_OPTS=""\
    LOG_CONFIG="/wdqs/logback.xml"

WORKDIR /wdqs

COPY --chown=blazegraph:blazegraph wait-for-it.sh entrypoint.sh runBlazegraph.sh runUpdate.sh /
COPY --chown=blazegraph:blazegraph mwservices.json /templates/mwservices.json
COPY --chown=blazegraph:blazegraph RWStore.properties whitelist.txt logback.xml /wdqs/

# TODO this shouldn't be needed, but CI currently doesnt check for the +x bit, which is why this line is here
RUN chmod +x /wdqs/runUpdate.sh

ENTRYPOINT ["/entrypoint.sh"]
