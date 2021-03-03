ARG COMPOSER_IMAGE_NAME
ARG COMPOSER_IMAGE_VERSION
ARG WIKIBASE_IMAGE_NAME
FROM ${WIKIBASE_IMAGE_NAME}:latest as base

FROM ${COMPOSER_IMAGE_NAME}:${COMPOSER_IMAGE_VERSION} as composer

COPY --from=base --chown=nobody:nogroup /var/www/html /var/www/html
COPY artifacts/extensions /var/www/html/extensions

WORKDIR /var/www/html/
RUN rm -rf /var/www/html/vendor
RUN rm -rf /var/www/html/composer.lock
RUN composer install --no-dev -vv -n

FROM ${WIKIBASE_IMAGE_NAME}:latest
RUN rm -rf /var/www/html/vendor
COPY --from=composer /var/www/html /var/www/html
COPY extra-install.sh /extra-install.sh

# copy extension settings
COPY LocalSettings.WikibaseManifest.php /var/www/html/LocalSettings.d/WikibaseManifest.php
COPY LocalSettings.OAuth.php /var/www/html/LocalSettings.d/OAuth.php
COPY LocalSettings.Scribunto.php /var/www/html/LocalSettings.d/Scribunto.php

# copy template for envsubst
COPY LocalSettings.Elasticsearch.php.template /var/www/html/LocalSettings.template.d/
