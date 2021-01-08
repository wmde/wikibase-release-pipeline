FROM php:7.3-apache

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

# set recommended PHP.ini settings
# see https://secure.php.net/manual/en/opcache.installation.php
RUN { \
		echo 'opcache.memory_consumption=128'; \
		echo 'opcache.interned_strings_buffer=8'; \
		echo 'opcache.max_accelerated_files=4000'; \
		echo 'opcache.revalidate_freq=60'; \
	} > /usr/local/etc/php/conf.d/opcache-recommended.ini

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
