ARG DEBIAN_IMAGE
ARG JDK_IMAGE

# ###########################################################################
# hadolint ignore=DL3006
FROM ${DEBIAN_IMAGE} as fetcher
ARG WDQS_VERSION

RUN apt-get update && \
    apt-get install --yes --no-install-recommends wget ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

SHELL ["/bin/bash", "-c"]
RUN set -euo pipefail; \
    set -x; \
    TARBALL="service-${WDQS_VERSION}-dist.tar.gz"; \
    wget --no-verbose "https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$WDQS_VERSION/$TARBALL"; \
    SIGNATURE="$TARBALL".md5; \
    wget --no-verbose "https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$WDQS_VERSION/$SIGNATURE"; \
    echo "$(cat $SIGNATURE)  $TARBALL" | md5sum -c; \
    mkdir /tmp/wdqs-service; \
    tar zxvf $TARBALL -C /tmp/wdqs-service --strip-components=1

# ###########################################################################
# hadolint ignore=DL3006
FROM ${JDK_IMAGE}
LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"

# Blazegraph scripts require bash
# Install gettext for envsubst command, (it needs libintl package)
# Install curl for the loadData.sh wdqs script (if someone needs it)
RUN set -x ; \
    apk --no-cache add bash=\<4.5.0 gettext=\<0.19.8.2 libintl=\<0.19.8.2 curl=\<7.64.999 su-exec=\~0.2 && \
    addgroup -g 66 -S blazegraph && adduser -S -G blazegraph -u 666 -s /bin/bash blazegraph

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
