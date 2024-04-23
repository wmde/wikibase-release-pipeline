ARG COMPOSER_IMAGE_URL
ARG WMDE_RELEASE_VERSION
ARG MEDIAWIKI_VERSION
ARG WIKIBASE_SUITE_WIKIBASE_IMAGE_URL

# ###########################################################################
FROM ${WIKIBASE_SUITE_WIKIBASE_IMAGE_URL}:${MEDIAWIKI_VERSION}-${WMDE_RELEASE_VERSION} as wikibase

# ###########################################################################
# hadolint ignore=DL3006
FROM ${COMPOSER_IMAGE_URL} as composer

COPY --from=wikibase --chown=nobody:nogroup /var/www/html /var/www/html
WORKDIR /var/www/html

COPY LocalSettings.d.template /tmp/LocalSettings.d.template

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
    rm -rf /var/www/html/vendor && \
    rm -rf /var/www/html/composer.lock && \
    composer install --no-dev -vv -n

# ###########################################################################
FROM ${WIKIBASE_SUITE_WIKIBASE_IMAGE_URL}:${MEDIAWIKI_VERSION}-${WMDE_RELEASE_VERSION}
LABEL org.opencontainers.image.source="https://github.com/wmde/wikibase-release-pipeline"
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install \
        --yes --no-install-recommends lua5.1 && \
    rm -rf /var/lib/apt/lists/* &&\
    \
    rm -rf /var/www/html
COPY --from=composer /var/www/html /var/www/html
COPY default-extra-install.sh /default-extra-install.sh
COPY oauth.ini /templates/oauth.ini

# MW_WG_UPLOAD_DIRECTORY set in original wikibase image
RUN chown www-data ${MW_WG_UPLOAD_DIRECTORY} -R
