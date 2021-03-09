ARG COMPOSER_IMAGE_NAME
ARG COMPOSER_IMAGE_VERSION
ARG MEDIAWIKI_IMAGE_NAME
FROM ubuntu:xenial as unpacker

RUN apt-get update && \
    apt-get install --yes --no-install-recommends unzip=6.* jq=1.* curl=7.* ca-certificates=201* && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir artifacts
COPY artifacts/Wikibase.tar.gz artifacts
RUN tar xzf artifacts/Wikibase.tar.gz

FROM ${MEDIAWIKI_IMAGE_NAME}:latest as collector

COPY --from=unpacker Wikibase /var/www/html/extensions/Wikibase

RUN rm /var/www/html/extensions/Wikibase/vendor -rf

FROM ${COMPOSER_IMAGE_NAME}:${COMPOSER_IMAGE_VERSION} as composer
COPY --from=collector --chown=nobody:nogroup /var/www/html /var/www/html
WORKDIR /var/www/html/
COPY composer.local.json /var/www/html/composer.local.json
RUN composer install --verbose -n --no-dev

FROM ${MEDIAWIKI_IMAGE_NAME}:latest

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --yes --no-install-recommends libbz2-dev=1.* gettext-base=0.19.* && \
    rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite

RUN install -d /var/log/mediawiki -o www-data

RUN docker-php-ext-install calendar bz2

COPY --from=composer --chown=root:root /var/www/html /var/www/html
COPY artifacts/wait-for-it.sh /wait-for-it.sh
COPY entrypoint.sh /entrypoint.sh
COPY LocalSettings.php.template /LocalSettings.php.template
COPY htaccess /var/www/html/.htaccess

RUN ln -s /var/www/html/ /var/www/html/w

ENV MW_SITE_NAME=wikibase-docker\
    MW_SITE_LANG=en\
    MW_WG_JOB_RUN_RATE=2\
    WIKIBASE_PINGBACK=false

ENTRYPOINT ["/bin/bash"]
CMD ["/entrypoint.sh"]
