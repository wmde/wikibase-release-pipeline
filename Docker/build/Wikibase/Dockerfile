# Build configuration
ARG COMPOSER_IMAGE_NAME
ARG COMPOSER_IMAGE_VERSION
ARG MEDIAWIKI_IMAGE_NAME
ARG MEDIAWIKI_IMAGE_VERSION

FROM ubuntu:xenial as unpacker

RUN mkdir artifacts

COPY artifacts/Wikibase.tar.gz artifacts
RUN tar xzf artifacts/Wikibase.tar.gz

FROM ${MEDIAWIKI_IMAGE_NAME}:${MEDIAWIKI_IMAGE_VERSION} as collector

COPY --from=unpacker Wikibase /var/www/html/extensions/Wikibase

RUN rm /var/www/html/extensions/Wikibase/vendor -rf

FROM ${COMPOSER_IMAGE_NAME}:${COMPOSER_IMAGE_VERSION} as composer
COPY --from=collector --chown=nobody:nogroup /var/www/html /var/www/html
WORKDIR /var/www/html/
COPY composer.local.json /var/www/html/composer.local.json
RUN composer install --verbose -n --no-dev

FROM ${MEDIAWIKI_IMAGE_NAME}:${MEDIAWIKI_IMAGE_VERSION}

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --yes --no-install-recommends libbz2-dev=1.* gettext-base && \
    rm -rf /var/lib/apt/lists/* && \
    a2enmod rewrite && \
    install -d /var/log/mediawiki -o www-data && \
    docker-php-ext-install calendar bz2

COPY --from=composer --chown=root:root /var/www/html /var/www/html
COPY artifacts/wait-for-it.sh /wait-for-it.sh
COPY entrypoint.sh /entrypoint.sh

ARG MEDIAWIKI_SETTINGS_TEMPLATE_FILE
COPY ${MEDIAWIKI_SETTINGS_TEMPLATE_FILE} /LocalSettings.php.template
COPY htaccess /var/www/html/.htaccess

RUN ln -s /var/www/html/ /var/www/html/w

# Mediawiki configuration
ARG MW_SITE_NAME
ARG MW_SITE_LANG
ARG MW_WG_JOB_RUN_RATE
ARG MW_WG_ENABLE_UPLOADS
ARG MW_WG_UPLOAD_DIRECTORY
ARG WIKIBASE_PINGBACK

ENV MW_SITE_NAME=${MW_SITE_NAME}\
    MW_SITE_LANG=${MW_SITE_LANG}\
    MW_WG_JOB_RUN_RATE=${MW_WG_JOB_RUN_RATE}\
    MW_WG_ENABLE_UPLOADS=${MW_WG_ENABLE_UPLOADS}\
    MW_WG_UPLOAD_DIRECTORY=${MW_WG_UPLOAD_DIRECTORY}\
    WIKIBASE_PINGBACK=${WIKIBASE_PINGBACK}

RUN chown www-data ${MW_WG_UPLOAD_DIRECTORY} -R

ENTRYPOINT ["/bin/bash"]
CMD ["/entrypoint.sh"]

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"