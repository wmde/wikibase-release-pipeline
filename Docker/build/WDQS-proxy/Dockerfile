FROM nginx:stable-alpine

COPY entrypoint.sh /entrypoint.sh
COPY wdqs.template /etc/nginx/conf.d/wdqs.template

ENV PROXY_MAX_QUERY_MILLIS=60000

ENTRYPOINT "/entrypoint.sh"

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"