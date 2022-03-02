ARG COMPOSER_IMAGE_NAME
ARG COMPOSER_IMAGE_VERSION
ARG WIKIBASE_IMAGE_NAME
FROM ${WIKIBASE_IMAGE_NAME}:latest as base

FROM ${COMPOSER_IMAGE_NAME}:${COMPOSER_IMAGE_VERSION} as composer

COPY --from=base --chown=nobody:nogroup /var/www/html /var/www/html
COPY artifacts/extensions /var/www/html/extensions

WORKDIR /var/www/html/
RUN rm -rf /var/www/html/vendor && \
    rm -rf /var/www/html/composer.lock && \
    composer install --no-dev -vv -n

FROM ${WIKIBASE_IMAGE_NAME}:latest
RUN rm -rf /var/www/html/vendor
COPY --from=composer /var/www/html /var/www/html
COPY extra-install/ /extra-install/
COPY artifacts/oauth.ini /templates/oauth.ini

# MW_WG_UPLOAD_DIRECTORY set in base image
RUN chown www-data ${MW_WG_UPLOAD_DIRECTORY} -R

# copy extension settings
COPY LocalSettings.d /var/www/html/LocalSettings.d

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"