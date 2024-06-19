# WBS Elasticsearch Image

[Elasticsearch](https://en.wikipedia.org/wiki/Elasticsearch) is a search engine based on the Lucene library.

This image contains the Elasticsearch server with the
[org.wikimedia.search/extra](https://central.sonatype.com/artifact/org.wikimedia.search/extra)
and
[org.wikimedia.search.highlighter/experimental-highlighter-elasticsearch-plugin](https://central.sonatype.com/artifact/org.wikimedia.search.highlighter/experimental-highlighter-elasticsearch-plugin)
plugins for [Wikibase](https://wikiba.se).

> 💡 This image is part of Wikibase Suite (WBS). [WBS Deploy](https://github.com/wmde/wikibase-release-pipeline/deploy/README.md) provides everything you need to self-host a Wikibase instance out of the box.

## Example

```yml
  wikibase:
    image: wikibase/wikibase
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped
    ports:
      - 8880:80
    volumes:
      - ./config:/config
      - wikibase-image-data:/var/www/html/images
    environment:
      MW_ADMIN_NAME: ${MW_ADMIN_NAME}
      MW_ADMIN_PASS: ${MW_ADMIN_PASS}
      MW_ADMIN_EMAIL: ${MW_ADMIN_EMAIL}
      MW_WG_SERVER: http://${WIKIBASE_PUBLIC_HOST}
      DB_SERVER: mysql:3306
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
      DB_NAME: ${DB_NAME}
      ELASTICSEARCH_HOST: elasticsearch
    healthcheck:
      test: curl --silent --fail localhost/wiki/Main_Page
      interval: 10s
      start_period: 5m

  wikibase-jobrunner:
    image: wikibase/wikibase
    command: /jobrunner-entrypoint.sh
    depends_on:
      wikibase:
        condition: service_healthy
    restart: always
    volumes_from:
      - wikibase

  mysql:
    image: mariadb:10.11
    restart: unless-stopped
    volumes:
      - mysql-data:/var/lib/mysql
    environment:
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASS}
      MYSQL_RANDOM_ROOT_PASSWORD: yes
    healthcheck:
      test: healthcheck.sh --connect --innodb_initialized
      start_period: 1m
      interval: 20s
      timeout: 5s

  elasticsearch:
    image: wikibase/elasticsearch
    restart: unless-stopped
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    environment:
      discovery.type: single-node
      ES_JAVA_OPTS: -Xms512m -Xmx512m -Dlog4j2.formatMsgNoLookups=true
    healthcheck:
      test: curl --silent --fail localhost:9200
      interval: 10s
      start_period: 2m

volumes:
  wikibase-image-data:
  mysql-data:
  elasticsearch-data:
```

### Database

The database MediaWiki will connect to and store all its data in. Technically,
MediaWiki supports multiple database engines. Though, MariaDB is the most
commonly used. This is also the only engine used to test the image before
release.

### Configuration Volume

MediaWiki will generate a `LocalSettings.php` file on first launch. This file
needs to be maintained by you, as you own it after generation. The Configuration
Volume is the place where this file will be stored.

### Environment variables for initial settings

Those variables are only respected on first launch for generating MediaWikis
`LocalSettings.php` file. When launching the image with a `LocalSettings.php`
file present in the Configuration Volume, environment variables will not be
taken into account.

Variables in **bold** are required on first launch without `LocalSettings.php`
in the Configuration Volume. The image will fail to start if one of those
variables does not have a value. Default values do not need to be overwritten.

| Variable                     | Default    | Description                                                                                                                                                                                                  |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`DB_SERVER`**              | undefined  | Hostname and port for the MySQL server to use for MediaWiki & Wikibase                                                                                                                                       |
| **`DB_USER`**                | undefined  | Username to use for the MySQL server                                                                                                                                                                         |
| **`DB_PASS`**                | undefined  | Password to use for the MySQL server                                                                                                                                                                         |
| **`DB_NAME`**                | "my_wiki"  | Database name to use for the MySQL server                                                                                                                                                                    |
| **`MW_ADMIN_NAME`**          | undefined  | Admin username to create on MediaWiki first install                                                                                                                                                          |
| **`MW_ADMIN_PASS`**          | undefined  | Admin password to use for admin account on first install                                                                                                                                                     |
| **`MW_ADMIN_EMAIL`**         | undefined  | Admin password to use for admin account on first install                                                                                                                                                     |
| **`MW_WG_SERVER`**           | undefined  | $wgServer to use for MediaWiki. A value matching how this site is accessed from the user's browser is required.                                                                                              |
| **`MW_WG_SITENAME`**         | "wikibase" | $wgSitename to use for MediaWiki                                                                                                                                                                             |
| **`MW_WG_LANGUAGE_CODE`**    | "en"       | $wgLanguageCode to use for MediaWiki                                                                                                                                                                         |
| `ELASTICSEARCH_HOST`         | undefined  | Hostname to an Elasticsearch server with the Wikibase Extension installed, such as [wikibase/elasticsearch](https://hub.docker.com/r/wikibase/elasticsearch). Leave this undefined to disable ElasticSearch. |
| `ELASTICSEARCH_PORT`         | 9200       | Port which Elasticsearch is available on                                                                                                                                                                     |
| `QUICKSTATEMENTS_PUBLIC_URL` | undefined  | Public URL of the Quickstatements server, such as [wikibase/quickstatements](https://hub.docker.com/r/wikibase/quickstatements). Leave undefined to disable QuickStatements functionality.                   |

### Job Runner

MediaWiki/Wikibase depends on [jobs being run in the background](https://www.mediawiki.org/wiki/Manual:Job_queue).
This can be either done on HTTP request, or by a dedicated Job Runner. The
default configuration of this image requires such an external Job Runner.

To setup an external Job Runner, use this image for a second container,
overwrite the command to `/jobrunner-entrypoint.sh` and share the same
Configuration Volume with it.

## Example

You can use the following example Docker Compose to setup and run the image. Your Wikibase will be available on [http://localhost](http://localhost).

```yml
services:
  wikibase:
    image: wikibase/wikibase
    ports:
      - 80:80
    volumes:
      - ./config:/config
      - wikibase-image-data:/var/www/html/images
    environment:
      MW_ADMIN_NAME: "admin"
      MW_ADMIN_PASS: "change-this-password"
      MW_ADMIN_EMAIL: "admin@example.com"
      MW_WG_SERVER: http://localhost
      DB_SERVER: mysql:3306
      DB_NAME: "my_wiki"
      DB_USER: "mariadb-user"
      DB_PASS: "change-this-password"
    healthcheck:
      test: curl --silent --fail localhost/wiki/Main_Page
      interval: 10s
      start_period: 5m
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped

  wikibase-jobrunner:
    image: wikibase/wikibase
    command: /jobrunner-entrypoint.sh
    depends_on:
      wikibase:
        condition: service_healthy
    restart: always
    volumes_from:
      - wikibase

  mysql:
    image: mariadb:10.11
    volumes:
      - mysql-data:/var/lib/mysql
    environment:
      MYSQL_DATABASE: "my_wiki"
      MYSQL_USER: "mariadb-user"
      MYSQL_PASSWORD: "change-this-password"
      MYSQL_RANDOM_ROOT_PASSWORD: yes
    healthcheck:
      test: healthcheck.sh --connect --innodb_initialized
      start_period: 1m
      interval: 20s
      timeout: 5s
    restart: unless-stopped

volumes:
  wikibase-image-data:
  mysql-data:
```

## Tags and Versioning

This Elasticsearch Image is using [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

We provide several tags that relate to the versioning semantics.

| Tag                                                             | Example                            | Description                                                                                                                                                                                                                                |
| --------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| _MAJOR_                                                         | 3                                  | Tags the latest image with this major version. Gets overwritten whenever a new version is released with this major version. This will include new builds triggered by base image changes, patch version updates and minor version updates. |
| _MAJOR_._MINOR_                                                 | 3.1                                | Tags the latest image with this major and minor version. Gets overwritten whenever a new version is released with this major and minor version. This will include new builds triggered by base image changes and patch version updates.    |
| _MAJOR_._MINOR_._PATCH_                                         | 3.1.7                              | Tags the latest image with this major, minor and patch version. Gets overwritten whenever a new version is released with this major, minor and patch version. This only happens for new builds triggered by base image changes.            |
| _MAJOR_._MINOR_._PATCH_\_es*ES-VERSION*                         | 3.1.7_es7.20.2                     | Same as above, but also mentioning the current Elasticsearch version.                                                                                                                                                                      |
| _MAJOR_._MINOR_._PATCH_\_es*ES-VERSION*\_build*BUILD-TIMESTAMP* | 3.1.7_es7.10.2_build20240530103941 | Tag that never gets overwritten. Every image will have this tag with a unique build timestamp. Can be used to reference images explicitly for reproducibility.                                                                             |
| deploy-_WBS-DEPLOY-VERSION_                                     | deploy-3                           | Tags the latest image compatible with the given version of [WBS Deploy](https://github.com/wmde/wikibase-release-pipeline/deploy/README.md).                                                                                               |

## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/Elasticsearch/Dockerfile).

## Authors & Contact

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not listed above or need help, use this [bug report
form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start
a conversation with the engineering team.
