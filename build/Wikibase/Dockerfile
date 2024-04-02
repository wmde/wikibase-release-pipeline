# Build configuration
ARG MEDIAWIKI_IMAGE_URL
ARG COMPOSER_IMAGE_URL

# ###########################################################################
# hadolint ignore=DL3006
FROM ${COMPOSER_IMAGE_URL} as git-checkout
ARG WIKIBASE_COMMIT
RUN git clone https://gerrit.wikimedia.org/r/mediawiki/extensions/Wikibase /tmp/wikibase && \
    git -C /tmp/wikibase checkout ${WIKIBASE_COMMIT} && \
    git -C /tmp/wikibase submodule update --init --recursive && \
    rm -f /tmp/wikibase/.travis.yml && \
    find /tmp/wikibase -name ".git*" -exec rm -rf {} +

# ###########################################################################
# hadolint ignore=DL3006
FROM ${MEDIAWIKI_IMAGE_URL} as collector
COPY --from=git-checkout /tmp/wikibase /var/www/html/extensions/Wikibase

# COPY ./fix-do-not-add-stdport-in-detectServer.patch /tmp/fix-do-not-add-stdport-in-detectServer.patch
# WORKDIR /var/www/html
# RUN patch -Np1 < /tmp/fix-do-not-add-stdport-in-detectServer.patch

# ###########################################################################
# hadolint ignore=DL3006
FROM ${COMPOSER_IMAGE_URL} as composer
COPY --from=collector --chown=nobody:nogroup /var/www/html /var/www/html
WORKDIR /var/www/html/
COPY composer.local.json /var/www/html/composer.local.json
RUN composer install --verbose -n --no-dev \
    --ignore-platform-req=ext-calendar \
    --ignore-platform-req=ext-intl

# ###########################################################################
# hadolint ignore=DL3006
FROM ${MEDIAWIKI_IMAGE_URL}
ARG GIT_CURRENT_REVISION
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
    \
    a2enmod rewrite && \
    install -d /var/log/mediawiki -o www-data && \
    docker-php-ext-install calendar bz2

COPY --from=composer --chown=root:root /var/www/html /var/www/html
COPY wait-for-it.sh /wait-for-it.sh
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
