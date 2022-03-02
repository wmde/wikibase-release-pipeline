ARG COMPOSER_IMAGE_NAME
ARG COMPOSER_IMAGE_VERSION
FROM ubuntu:xenial as fetcher

COPY artifacts/quickstatements.tar.gz artifacts/quickstatements.tar.gz
RUN tar xzf artifacts/quickstatements.tar.gz

FROM ${COMPOSER_IMAGE_NAME}:${COMPOSER_IMAGE_VERSION} as composer
COPY --from=fetcher --chown=nobody:nogroup /quickstatements/composer.json /quickstatements/composer.json

WORKDIR /quickstatements
RUN composer install --no-dev

FROM php:7.3-apache

# Install envsubst
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --yes --no-install-recommends gettext-base jq libicu-dev && \
    rm -rf /var/lib/apt/lists/* && \
    docker-php-ext-configure intl && \
    docker-php-ext-install intl

COPY --from=fetcher /quickstatements /var/www/html/quickstatements
COPY --from=composer --chown=root:root /quickstatements/vendor /var/www/html/quickstatements/vendor
COPY --from=fetcher /magnustools /var/www/html/magnustools

COPY entrypoint.sh /entrypoint.sh

COPY config.json /templates/config.json
COPY oauth.ini /templates/oauth.ini
COPY php.ini /templates/php.ini

ENV APACHE_DOCUMENT_ROOT /var/www/html/quickstatements/public_html
RUN sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf && \
    sed -ri -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

ENV MW_SITE_NAME=wikibase-docker\
    MW_SITE_LANG=en\
    PHP_TIMEZONE=UTC

RUN install -d -owww-data /var/log/quickstatements

ENTRYPOINT ["/bin/bash"]
CMD ["/entrypoint.sh"]

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"