# Build configuration
ARG MEDIAWIKI_IMAGE
ARG COMPOSER_IMAGE
ARG GIT_IMAGE
ARG WIKIBASE_COMMIT
ARG GIT_CURRENT_REVISION

ARG MEDIAWIKI_SETTINGS_TEMPLATE_FILE

# ###########################################################################
FROM ${GIT_IMAGE} as git-checkout
WORKDIR /tmp
RUN git clone https://gerrit.wikimedia.org/r/mediawiki/extensions/Wikibase wikibase
WORKDIR /tmp/wikibase
RUN git checkout ${WIKIBASE_COMMIT}
RUN git submodule update --init --recursive
RUN rm -f .travis.yml
RUN find . -name .git | xargs rm -rf

# ###########################################################################
FROM ${MEDIAWIKI_IMAGE} as collector
COPY --from=git-checkout /tmp/wikibase /var/www/html/extensions/Wikibase

# ###########################################################################
FROM ${COMPOSER_IMAGE} as composer
COPY --from=collector --chown=nobody:nogroup /var/www/html /var/www/html
WORKDIR /var/www/html/
COPY composer.local.json /var/www/html/composer.local.json
RUN composer install --verbose -n --no-dev \
    --ignore-platform-req=ext-calendar \
    --ignore-platform-req=ext-intl

# ###########################################################################
FROM ${MEDIAWIKI_IMAGE}
LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"
# Set error_reporting PHP.ini settings
# This is needed with PHP8+ and MediaWiki 1.39, as Wikibase contains deprecated code
# TODO: remove this and see how far we get
RUN { \
    echo 'error_reporting = E_ALL ^ E_DEPRECATED'; \
} > /usr/local/etc/php/conf.d/error_reporting.ini

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive \
    apt-get install --yes --no-install-recommends libbz2-dev=1.* gettext-base && \
    rm -rf /var/lib/apt/lists/* && \
    a2enmod rewrite && \
    install -d /var/log/mediawiki -o www-data && \
    docker-php-ext-install calendar bz2

COPY --from=composer --chown=root:root /var/www/html /var/www/html
COPY artifacts/wait-for-it.sh /wait-for-it.sh
COPY entrypoint.sh /entrypoint.sh

COPY LocalSettings.php.template /LocalSettings.php.template
COPY htaccess /var/www/html/.htaccess

RUN ln -s /var/www/html/ /var/www/html/w

# Mediawiki build time configuration
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

RUN mkdir /var/www/html/uploads && \
    chown www-data /var/www/html/uploads -R && \
    chmod o-w /var/www/html

ENTRYPOINT ["/bin/bash"]
CMD ["/entrypoint.sh"]
