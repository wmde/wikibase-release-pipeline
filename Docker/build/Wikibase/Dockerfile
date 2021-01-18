ARG MEDIAWIKI_IMAGE_NAME
FROM ubuntu:xenial as unpacker

RUN apt-get update && \
    apt-get install --yes --no-install-recommends unzip=6.* jq=1.* curl=7.* ca-certificates=201* && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY Wikibase.tar.gz .
RUN tar xzf Wikibase.tar.gz

FROM ${MEDIAWIKI_IMAGE_NAME}:latest as collector
COPY --from=unpacker Wikibase /var/www/html/extensions/Wikibase
RUN rm /var/www/html/extensions/Wikibase/vendor -rf

FROM composer:1.10.19 as composer
COPY --from=collector /var/www/html /var/www/html
WORKDIR /var/www/html/
COPY composer.local.json /var/www/html/composer.local.json
RUN apk add icu-dev && docker-php-ext-install mysqli pdo pdo_mysql && docker-php-ext-configure intl && docker-php-ext-install intl
RUN composer install --no-dev --verbose -n

FROM ${MEDIAWIKI_IMAGE_NAME}:latest

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --yes --no-install-recommends libbz2-dev=1.* gettext-base=0.19.* && \
    rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite

RUN install -d /var/log/mediawiki -o www-data

RUN docker-php-ext-install calendar bz2

COPY --from=composer /var/www/html /var/www/html
COPY wait-for-it.sh /wait-for-it.sh
COPY entrypoint.sh /entrypoint.sh
COPY LocalSettings.php.template /LocalSettings.php.template
COPY htaccess /var/www/html/.htaccess

RUN ln -s /var/www/html/ /var/www/html/w

ENV MW_SITE_NAME=wikibase-docker\
    MW_SITE_LANG=en

ENTRYPOINT ["/bin/bash"]
CMD ["/entrypoint.sh"]
