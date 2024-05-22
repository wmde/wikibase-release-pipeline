# Build configuration
ARG PHP_IMAGE_URL
ARG COMPOSER_IMAGE_URL

# ###########################################################################
# hadolint ignore=DL3006
# Based on 
# https://github.com/wikimedia/mediawiki-docker/blob/1161796f04d6a6bcbec9fb4c67a8ce7248392403/1.41/apache/Dockerfile
FROM ${PHP_IMAGE_URL} as mediawiki

# System dependencies
RUN set -eux; \
    \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        git \
        librsvg2-bin \
        imagemagick \
        # Required for SyntaxHighlighting
        python3 \
        ; \
    rm -rf /var/lib/apt/lists/*

# Install the PHP extensions we need
RUN set -eux; \
    \
    savedAptMark="$(apt-mark showmanual)"; \
    \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        libicu-dev \
        libonig-dev \
        ; \
    \
    docker-php-ext-install -j "$(nproc)" \
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
RUN set -eux; \
    a2enmod rewrite; \
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
RUN set -eux; \
    curl -fSL "https://releases.wikimedia.org/mediawiki/$(echo ${MEDIAWIKI_VERSION} | cut -d. -f1,2)/mediawiki-${MEDIAWIKI_VERSION}.tar.gz" -o mediawiki.tar.gz; \
    tar -x --strip-components=1 -f mediawiki.tar.gz; \
    rm -r mediawiki.tar.gz; \
    chown -R www-data:www-data extensions skins cache images;

# ###########################################################################
# hadolint ignore=DL3006
FROM ${COMPOSER_IMAGE_URL} as composer

COPY --from=mediawiki --chown=nobody:nogroup /var/www/html /var/www/html
WORKDIR /var/www/html

COPY composer.local.json composer.local.json

ARG WIKIBASE_COMMIT
RUN git clone https://gerrit.wikimedia.org/r/mediawiki/extensions/Wikibase /var/www/html/extensions/Wikibase && \
    git -C /var/www/html/extensions/Wikibase checkout ${WIKIBASE_COMMIT} && \
    git -C /var/www/html/extensions/Wikibase submodule update --init --recursive && \
    rm -f /var/www/html/extensions/Wikibase/.travis.yml && \
    find /var/www/html/extensions/Wikibase -name ".git*" -exec rm -rf {} +

ARG ALL_EXTENSIONS="Babel,cldr,CirrusSearch,ConfirmEdit,Elastica,EntitySchema,Nuke,OAuth,Scribunto,SyntaxHighlight_GeSHi,UniversalLanguageSelector,VisualEditor,WikibaseCirrusSearch,WikibaseManifest"
ARG BABEL_COMMIT
ARG CLDR_COMMIT
ARG CIRRUSSEARCH_COMMIT
ARG CONFIRMEDIT_COMMIT
ARG ELASTICA_COMMIT
ARG ENTITYSCHEMA_COMMIT
ARG NUKE_COMMIT
ARG OAUTH_COMMIT
ARG SCRIBUNTO_COMMIT
ARG SYNTAXHIGHLIGHT_GESHI_COMMIT
ARG UNIVERSALLANGUAGESELECTOR_COMMIT
ARG VISUALEDITOR_COMMIT
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
    rm -rf vendor && \
    rm -rf composer.lock && \
    ls -la && pwd && \
    composer install --no-dev -vv -n


# ###########################################################################
# hadolint ignore=DL3006
FROM mediawiki

LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"

ARG GIT_CURRENT_REVISION

# Set error_reporting PHP.ini settings
# This is needed with PHP8+ and MediaWiki 1.39, as Wikibase contains deprecated code
# TODO: remove this and see how far we get
RUN { \
    echo 'error_reporting = E_ALL ^ E_DEPRECATED'; \
} > /usr/local/etc/php/conf.d/error_reporting.ini

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive \
    apt-get install --yes --no-install-recommends libbz2-dev=1.* gettext-base lua5.1 && \
    rm -rf /var/lib/apt/lists/* && \
    \
    a2enmod rewrite && \
    install -d /var/log/mediawiki -o www-data && \
    docker-php-ext-install calendar bz2

COPY --from=composer --chown=nobody:nogroup /var/www/html /var/www/html

# Remove world writable flag, in combination with sticky bit it breaks the w link
# https://github.com/wmde/wikibase-release-pipeline/commit/545c7aeec8d0245dc597d500afc934b40e656b3c
RUN chmod o-w /var/www/html && \
    ln -s /var/www/html/ /var/www/html/w

COPY wikibase-php.ini /usr/local/etc/php/conf.d/wikibase-php.ini
COPY entrypoint.sh /entrypoint.sh
COPY jobrunner-entrypoint.sh /jobrunner-entrypoint.sh
COPY htaccess /var/www/html/.htaccess
COPY LocalSettings.d LocalSettings.d
COPY LocalSettings.wbs.php /var/www/html/LocalSettings.wbs.php

# Make upload path writable for the webserver user
RUN chown www-data /var/www/html/images -R

COPY default-extra-install.sh /default-extra-install.sh
COPY oauth.ini /templates/oauth.ini

# MediaWiki build time configuration
ARG MW_WG_SITENAME
ARG MW_WG_LANGUAGE_CODE

ENV DB_NAME=my_wiki\
    MW_WG_SITENAME=${MW_WG_SITENAME}\
    MW_WG_LANGUAGE_CODE=${MW_WG_LANGUAGE_CODE}\
    ELASTICSEARCH_PORT=9200

ENTRYPOINT ["/bin/bash"]
CMD ["/entrypoint.sh"]
