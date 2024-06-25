ARG COMPOSER_IMAGE_URL
ARG PHP_IMAGE_URL

# ###########################################################################
# hadolint ignore=DL3006
FROM ${COMPOSER_IMAGE_URL} as composer
ARG QUICKSTATEMENTS_COMMIT
ARG MAGNUSTOOLS_COMMIT

RUN \
    git clone https://github.com/magnusmanske/quickstatements /tmp/quickstatements && \
    git -C /tmp/quickstatements checkout ${QUICKSTATEMENTS_COMMIT} && \
    git -C /tmp/quickstatements submodule update --init --recursive && \
    \
    git clone https://bitbucket.org/magnusmanske/magnustools.git /tmp/magnustools && \
    git -C /tmp/magnustools checkout ${MAGNUSTOOLS_COMMIT}

WORKDIR /tmp/quickstatements
RUN composer install --no-dev

# ###########################################################################
# hadolint ignore=DL3006
FROM ${PHP_IMAGE_URL}
LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --yes --no-install-recommends gettext-base jq libicu-dev && \
    rm -rf /var/lib/apt/lists/* && \
    \
    docker-php-ext-configure intl && \
    docker-php-ext-install intl

COPY --from=composer /tmp/quickstatements /var/www/html/quickstatements
COPY --from=composer /tmp/magnustools /var/www/html/magnustools

COPY entrypoint.sh /entrypoint.sh

COPY config.json /templates/config.json
COPY oauth.ini /templates/oauth.ini
COPY php.ini /templates/php.ini

ENV APACHE_DOCUMENT_ROOT /var/www/html/quickstatements/public_html
RUN sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf && \
    sed -ri -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

ENV SITENAME=wikibase \
    MW_WG_LANGUAGE_CODE=en \
    PHP_TIMEZONE=UTC \
    WB_ITEM_NAMESPACE=120 \
    WB_PROPERTY_NAMESPACE=122 \
    WB_ITEM_PREFIX="Item:" \
    WB_PROPERTY_PREFIX="Property:"

RUN install -d -owww-data /var/log/quickstatements

ENTRYPOINT ["/bin/bash"]
CMD ["/entrypoint.sh"]
