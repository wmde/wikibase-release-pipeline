# Inspired by mediawiki-docker's apache Dockerfile:
# https://github.com/wikimedia/mediawiki-docker/blob/dc240fc8771ce74bc2c420eb1283d718ebf1abe0/1.35/apache/Dockerfile

ARG PHP_VERSION
FROM php:${PHP_VERSION}-apache

# System dependencies
RUN set -eux; \
	\
	apt-get update; \
	apt-get install -y --no-install-recommends \
		librsvg2-bin \
		imagemagick \
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
	; \
	\
	docker-php-ext-install -j "$(nproc)" \
		intl \
		mbstring \
		mysqli \
		opcache \
	; \
	\
	pecl install APCu-5.1.18; \
	docker-php-ext-enable \
		apcu \
	; \
	\
	rm -rf /var/lib/apt/lists/*

# Enable Short URLs
COPY short-url.conf "$APACHE_CONFDIR/conf-available/short-url.conf"
RUN set -eux; a2enmod rewrite; a2enconf short-url

# set recommended PHP.ini settings
# see https://secure.php.net/manual/en/opcache.installation.php
COPY opcache-recommended.ini /usr/local/etc/php/conf.d/opcache-recommended.ini

# Major version ex. 1.35
ARG MEDIAWIKI_MAJOR_VERSION
ENV MEDIAWIKI_MAJOR_VERSION ${MEDIAWIKI_MAJOR_VERSION}

# Version ex. 1.35.0
ARG MEDIAWIKI_VERSION
ENV MEDIAWIKI_VERSION ${MEDIAWIKI_VERSION}

# MediaWiki setup
COPY mediawiki.tar.gz /tmp/mediawiki.tar.gz
RUN tar -x --strip-components=1 -f /tmp/mediawiki.tar.gz;
RUN rm /tmp/mediawiki.tar.gz;
RUN chown -R www-data:www-data extensions skins cache images;

CMD ["apache2-foreground"]
