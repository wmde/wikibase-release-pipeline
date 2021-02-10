ARG WIKIBASE_IMAGE_NAME
FROM ${WIKIBASE_IMAGE_NAME}:latest as base

FROM composer:1.10.19 as composer

COPY --from=base /var/www/html /var/www/html
COPY artifacts/extensions /var/www/html/extensions

WORKDIR /var/www/html/
RUN apk add icu-dev && docker-php-ext-install mysqli pdo pdo_mysql && docker-php-ext-configure intl && docker-php-ext-install intl
RUN composer install --no-dev --verbose -n

FROM ${WIKIBASE_IMAGE_NAME}:latest

COPY --from=composer /var/www/html /var/www/html
COPY extra-install.sh /extra-install.sh
COPY LocalSettings.OAuth.php /var/www/html/LocalSettings.d/OAuth.php
COPY LocalSettings.Scribunto.php /var/www/html/LocalSettings.d/Scribunto.php
COPY LocalSettings.Elasticsearch.php.template /var/www/html/LocalSettings.template.d/
