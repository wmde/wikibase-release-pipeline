ARG NGINX_IMAGE_URL

# ###########################################################################
# hadolint ignore=DL3006
FROM ${NGINX_IMAGE_URL}
LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"

COPY entrypoint.sh /entrypoint.sh
COPY wdqs.template /etc/nginx/conf.d/wdqs.template

ENV PROXY_MAX_QUERY_MILLIS=60000\
    PROXY_PASS_HOST=wdqs:9999

ENTRYPOINT "/entrypoint.sh"
