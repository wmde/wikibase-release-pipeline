ARG COMPOSER_IMAGE_NAME
ARG COMPOSER_IMAGE_VERSION
ARG WIKIBASE_IMAGE_NAME
FROM ${WIKIBASE_IMAGE_NAME}:latest as base

FROM ${COMPOSER_IMAGE_NAME}:${COMPOSER_IMAGE_VERSION} as composer

COPY --from=base --chown=nobody:nogroup /var/www/html /var/www/html
COPY artifacts/extensions /var/www/html/extensions

WORKDIR /var/www/html/
RUN rm -rf /var/www/html/vendor
RUN rm -rf /var/www/html/composer.lock
RUN composer install --no-dev -vv -n

FROM ${WIKIBASE_IMAGE_NAME}:latest
RUN rm -rf /var/www/html/vendor
COPY --from=composer /var/www/html /var/www/html
COPY extra-install.sh /extra-install.sh

# MW_WG_UPLOAD_DIRECTORY set in base image
RUN chown www-data ${MW_WG_UPLOAD_DIRECTORY} -R

# copy extension settings
COPY LocalSettings.WikibaseLocalMedia.php /var/www/html/LocalSettings.d/WikibaseLocalMedia.php
COPY LocalSettings.WikibaseManifest.php /var/www/html/LocalSettings.d/WikibaseManifest.php
COPY LocalSettings.OAuth.php /var/www/html/LocalSettings.d/OAuth.php
COPY LocalSettings.UniversalLanguageSelector.php /var/www/html/LocalSettings.d/UniversalLanguageSelector.php
COPY LocalSettings.EntitySchema.php /var/www/html/LocalSettings.d/EntitySchema.php
COPY LocalSettings.Scribunto.php /var/www/html/LocalSettings.d/Scribunto.php
COPY LocalSettings.VisualEditor.php /var/www/html/LocalSettings.d/VisualEditor.php
COPY LocalSettings.cldr.php /var/www/html/LocalSettings.d/cldr.php
COPY LocalSettings.Nuke.php /var/www/html/LocalSettings.d/Nuke.php

# copy template for envsubst
COPY LocalSettings.Elasticsearch.php.template /var/www/html/LocalSettings.template.d/
