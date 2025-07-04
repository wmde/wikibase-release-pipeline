# Build configuration
ARG PHP_IMAGE_URL
ARG COMPOSER_IMAGE_URL

# ###########################################################################
# Based on https://github.com/wikimedia/mediawiki-docker/blob/1161796f04d6a6bcbec9fb4c67a8ce7248392403/1.41/apache/Dockerfile
# hadolint ignore=DL3006
FROM ${PHP_IMAGE_URL} as mediawiki

SHELL ["/bin/bash", "-exu", "-c"]

# System dependencies
RUN apt-get update; \
    apt-get install -y --no-install-recommends \
        git \
        gettext-base \
        librsvg2-bin \
        imagemagick \
        # Required by SyntaxHighlighting MediaWiki Extension
        python3 \
        # Required by Scribunto MediaWiki Extension
        lua5.1 \
        # Required by PdfHandler MediaWiki Extension
        ghostscript poppler-utils \
        # Required by PagedTiffHandler MediaWiki Extension
    	exiv2 libtiff-tools \
        # Required by TimedMediaHandler MediaWiki Extension
        ffmpeg \
        # Required by VipsScaler MediaWiki Extension
    	libvips-tools \
        ; \
    rm -rf /var/lib/apt/lists/*

# Install the PHP extensions we need
# hadolint ignore=DL4006
RUN savedAptMark="$(apt-mark showmanual)"; \
    \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libicu-dev \
        libonig-dev \
        libbz2-dev=1.* \
        ; \
    \
    docker-php-ext-install -j "$(nproc)" \
        bz2 \
        calendar \
        intl \
        mbstring \
        mysqli \
        opcache \
        ; \
    \
    pecl install APCu-5.1.21; \
        docker-php-ext-enable \
        apcu \
        ; \
    rm -r /tmp/pear; \
    \
    # reset apt-mark's "manual" list so that "purge --auto-remove" will remove all build dependencies
    apt-mark auto '.*' > /dev/null; \
    apt-mark manual $savedAptMark; \
    ldd "$(php -r 'echo ini_get("extension_dir");')"/*.so \
        | awk '/=>/ { print $3 }' \
        | sort -u \
        | xargs -r dpkg-query -S \
        | cut -d: -f1 \
        | sort -u \
        | xargs -rt apt-mark manual; \
    \
    apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
    rm -rf /var/lib/apt/lists/*

# Enable Short URLs
RUN a2enmod rewrite; \
    { \
    echo "<Directory /var/www/html>"; \
    echo "  RewriteEngine On"; \
    echo "  RewriteCond %{REQUEST_FILENAME} !-f"; \
    echo "  RewriteCond %{REQUEST_FILENAME} !-d"; \
    echo "  RewriteRule ^ %{DOCUMENT_ROOT}/index.php [L]"; \
    echo "</Directory>"; \
    } > "$APACHE_CONFDIR/conf-available/short-url.conf"; \
    a2enconf short-url

# Enable AllowEncodedSlashes for VisualEditor
RUN sed -i "s/<\/VirtualHost>/\tAllowEncodedSlashes NoDecode\n<\/VirtualHost>/" "$APACHE_CONFDIR/sites-available/000-default.conf"

# set recommended PHP.ini settings
# see https://secure.php.net/manual/en/opcache.installation.php
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=4000'; \
    echo 'opcache.revalidate_freq=60'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

# MediaWiki setup
WORKDIR /var/www/html
ARG MEDIAWIKI_VERSION
# hadolint ignore=DL4006
RUN set -eux; \
    curl -fSL "https://releases.wikimedia.org/mediawiki/$(echo ${MEDIAWIKI_VERSION} | cut -d. -f1,2)/mediawiki-${MEDIAWIKI_VERSION}.tar.gz" -o mediawiki.tar.gz; \
    tar -x --strip-components=1 -f mediawiki.tar.gz; \
    rm -r mediawiki.tar.gz; \
    install -d /var/log/mediawiki -o www-data

# ###########################################################################
# hadolint ignore=DL3006
FROM ${COMPOSER_IMAGE_URL} as composer

COPY --from=mediawiki --chown=nobody:nogroup /var/www/html /var/www/html
WORKDIR /var/www/html

COPY composer.local.json composer.local.json

# WORKAROUND for https://phabricator.wikimedia.org/T372458
# Take wikibase submodules from github as phabricator rate limits us
COPY --chown=nobody:nogroup --chmod=755 \
  wikibase-submodules-from-github-instead-of-phabricator.patch \
  /tmp/wikibase-submodules-from-github-instead-of-phabricator.patch

# WORKAROUND for oauth on same domain problem introduced 
# by https://phabricator.wikimedia.org/T299737#8171169
COPY --chown=nobody:nogroup --chmod=755 \
  mediawiki-extensions-OAuth-same-domain.patch \
  /tmp/mediawiki-extensions-OAuth-same-domain.patch

USER root
RUN apt-get update; \
    apt-get install -y --no-install-recommends \
        patch \
        ; \
    rm -rf /var/lib/apt/lists/*
USER nobody

ARG WIKIBASE_COMMIT
SHELL ["/bin/bash", "-euo", "pipefail", "-c"]
RUN set -x; \
    git clone https://gerrit.wikimedia.org/r/mediawiki/extensions/Wikibase /var/www/html/extensions/Wikibase && \
    git -C /var/www/html/extensions/Wikibase checkout ${WIKIBASE_COMMIT} && \
    patch -d /var/www/html/extensions/Wikibase -Np1 </tmp/wikibase-submodules-from-github-instead-of-phabricator.patch && \
    rm /tmp/wikibase-submodules-from-github-instead-of-phabricator.patch && \
    git -C /var/www/html/extensions/Wikibase submodule update --init --recursive && \
    rm -f /var/www/html/extensions/Wikibase/.travis.yml && \
    find /var/www/html/extensions/Wikibase -name ".git*" -exec rm -rf {} +

ARG ALL_EXTENSIONS="Babel,cldr,CirrusSearch,Elastica,EntitySchema,OAuth,UniversalLanguageSelector,WikibaseCirrusSearch,WikibaseManifest"
ARG BABEL_COMMIT
ARG CLDR_COMMIT
ARG CIRRUSSEARCH_COMMIT
ARG ELASTICA_COMMIT
ARG ENTITYSCHEMA_COMMIT
ARG OAUTH_COMMIT
ARG UNIVERSALLANGUAGESELECTOR_COMMIT
ARG WIKIBASECIRRUSSEARCH_COMMIT
ARG WIKIBASEMANIFEST_COMMIT
ARG WIKIBASEEDTF_COMMIT
ARG WIKIBASELOCALMEDIA_COMMIT

SHELL ["/bin/bash", "-euo", "pipefail", "-c"]
RUN set -x; \
    IFS=',' read -ra EXTENSIONS <<< ${ALL_EXTENSIONS}; \
    for EXTENSION in "${EXTENSIONS[@]}"; do \
        rm -rf "extensions/${EXTENSION}"; \
        git clone "https://gerrit.wikimedia.org/r/mediawiki/extensions/${EXTENSION}" "extensions/${EXTENSION}"; \
        EXTENSION_COMMIT_VAR="${EXTENSION^^}_COMMIT"; \
        EXTENSION_COMMIT="${!EXTENSION_COMMIT_VAR}"; \
        git -C "extensions/${EXTENSION}" checkout "${EXTENSION_COMMIT}"; \
        git -C "extensions/${EXTENSION}" submodule update --init --recursive; \
        rm -rf "extensions/${EXTENSION}/.git*"; \
        find "extensions/${EXTENSION}" -name ".git*" -exec rm -rf {} +; \
    done; \
    \
    git clone "https://github.com/ProfessionalWiki/WikibaseEdtf.git" "extensions/WikibaseEdtf"; \
    git -C "extensions/WikibaseEdtf" checkout "${WIKIBASEEDTF_COMMIT}"; \
    rm -rf "extensions/WikibaseEdtf/.git*"; \
    \
    git clone "https://github.com/ProfessionalWiki/WikibaseLocalMedia.git" "extensions/WikibaseLocalMedia"; \
    git -C "extensions/WikibaseLocalMedia" checkout "${WIKIBASELOCALMEDIA_COMMIT}"; \
    rm -rf "extensions/WikibaseLocalMedia/.git*"; \
    \
    patch -d /var/www/html/extensions/OAuth -Np1 </tmp/mediawiki-extensions-OAuth-same-domain.patch && \
    \
    rm -rf vendor && \
    rm -rf composer.lock && \
    ls -la && pwd && \
    composer install --no-dev -vv -n

# ###########################################################################
# hadolint ignore=DL3006
FROM mediawiki AS wikibase

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"

ARG GIT_CURRENT_REVISION

# Set error_reporting PHP.ini settings
# This is needed with PHP8+ and MediaWiki 1.39, as Wikibase contains deprecated code
# TODO: remove this and see how far we get
RUN { \
    echo 'error_reporting = E_ALL ^ E_DEPRECATED'; \
} > /usr/local/etc/php/conf.d/error_reporting.ini

COPY --from=composer --chown=nobody:nogroup /var/www/html /var/www/html

# Remove world writable flag, in combination with sticky bit it breaks the w link
# https://github.com/wmde/wikibase-release-pipeline/commit/545c7aeec8d0245dc597d500afc934b40e656b3c
# Make upload path writable for the webserver user
RUN chmod o-w /var/www/html && \
    ln -s /var/www/html/ /var/www/html/w && \
    chown www-data /var/www/html/images -R

COPY wikibase-php.ini /usr/local/etc/php/conf.d/wikibase-php.ini
COPY entrypoint.sh /entrypoint.sh
COPY jobrunner-entrypoint.sh /jobrunner-entrypoint.sh
COPY htaccess /var/www/html/.htaccess
COPY LocalSettings.d LocalSettings.d
COPY default-extra-install.sh /default-extra-install.sh
COPY oauth.ini /templates/oauth.ini
COPY LocalSettings.wbs.php /templates/LocalSettings.wbs.php

ENV DB_NAME=my_wiki \
    MW_WG_SITENAME=wikibase \
    MW_WG_LANGUAGE_CODE=en \
    ELASTICSEARCH_PORT=9200

ENTRYPOINT ["/bin/bash"]
CMD ["/entrypoint.sh"]
