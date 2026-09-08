FROM php:8.4-cli-alpine

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-suite"

RUN apk add --no-cache ca-certificates

COPY images/qlever-updater/runtime/ /
RUN chmod 755 /updater/entrypoint.sh

ENTRYPOINT ["/updater/entrypoint.sh"]
CMD ["updater.php"]
