# Build configuration
ARG MEDIAWIKI_IMAGE_URL
ARG COMPOSER_IMAGE_URL

# ###########################################################################
# hadolint ignore=DL3006
FROM ${MEDIAWIKI_IMAGE_URL} as mediawiki

# ###########################################################################
# hadolint ignore=DL3006
FROM ${COMPOSER_IMAGE_URL} as composer

COPY --from=mediawiki --chown=nobody:nogroup /var/www/html /var/www/html
WORKDIR /var/www/html

COPY LocalSettings.d.template /tmp/LocalSettings.d.template
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
    mkdir LocalSettings.d; \
    for EXTENSION in "${EXTENSIONS[@]}"; do \
        rm -rf "extensions/${EXTENSION}"; \
        git clone "https://gerrit.wikimedia.org/r/mediawiki/extensions/${EXTENSION}" "extensions/${EXTENSION}"; \
        EXTENSION_COMMIT_VAR="${EXTENSION^^}_COMMIT"; \
        EXTENSION_COMMIT="${!EXTENSION_COMMIT_VAR}"; \
        git -C "extensions/${EXTENSION}" checkout "${EXTENSION_COMMIT}"; \
        git -C "extensions/${EXTENSION}" submodule update --init --recursive; \
        rm -rf "extensions/${EXTENSION}/.git*"; \
        find "extensions/${EXTENSION}" -name ".git*" -exec rm -rf {} +; \
        cp "/tmp/LocalSettings.d.template/${EXTENSION}.php" LocalSettings.d/; \
    done; \
    \
    git clone "https://github.com/ProfessionalWiki/WikibaseEdtf.git" "extensions/WikibaseEdtf"; \
    git -C "extensions/WikibaseEdtf" checkout "${WIKIBASEEDTF_COMMIT}"; \
    rm -rf "extensions/WikibaseEdtf/.git*"; \
    cp "/tmp/LocalSettings.d.template/WikibaseEdtf.php" LocalSettings.d/; \
    \
    git clone "https://github.com/ProfessionalWiki/WikibaseLocalMedia.git" "extensions/WikibaseLocalMedia"; \
    git -C "extensions/WikibaseLocalMedia" checkout "${WIKIBASELOCALMEDIA_COMMIT}"; \
    rm -rf "extensions/WikibaseLocalMedia/.git*"; \
    cp "/tmp/LocalSettings.d.template/WikibaseLocalMedia.php" LocalSettings.d/; \
    \
    rm -rf vendor && \
    rm -rf composer.lock && \
    ls -la && pwd && \
    composer install --no-dev -vv -n


# ###########################################################################
# hadolint ignore=DL3006
FROM ${MEDIAWIKI_IMAGE_URL}

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

COPY wikibase-php.ini /usr/local/etc/php/conf.d/wikibase-php.ini
COPY entrypoint.sh /entrypoint.sh
COPY jobrunner-entrypoint.sh /jobrunner-entrypoint.sh
COPY htaccess /var/www/html/.htaccess
COPY LocalSettings.wbs.php /var/www/html/LocalSettings.wbs.php

RUN ln -s /var/www/html/ /var/www/html/w

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
