ARG COMPOSER_IMAGE_NAME
FROM ubuntu:xenial as fetcher

COPY artifacts/quickstatements.tar.gz artifacts/quickstatements.tar.gz
RUN tar xzf artifacts/quickstatements.tar.gz

FROM docker-registry.wikimedia.org/releng/composer:0.1.9 as composer
RUN php --version
COPY --from=fetcher --chown=nobody:nogroup /quickstatements /quickstatements

WORKDIR /quickstatements
RUN composer install --no-dev

FROM php:7.2-apache

# Install envsubst
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --yes --no-install-recommends gettext-base=0.19.* jq=1.5* && \
    rm -rf /var/lib/apt/lists/*

COPY --from=composer /quickstatements /var/www/html/quickstatements
COPY --from=fetcher /magnustools /var/www/html/magnustools

COPY entrypoint.sh /entrypoint.sh

COPY config.json /templates/config.json
COPY oauth.ini /templates/oauth.ini
COPY php.ini /templates/php.ini

ENV APACHE_DOCUMENT_ROOT /var/www/html/quickstatements/public_html
RUN sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf
RUN sed -ri -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

ENV MW_SITE_NAME=wikibase-docker\
    MW_SITE_LANG=en\
    PHP_TIMEZONE=UTC

RUN install -d -owww-data /var/log/quickstatements

ENTRYPOINT ["/bin/bash"]
CMD ["/entrypoint.sh"]
