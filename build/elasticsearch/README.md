# Wikibase Suite Elasticsearch Image

[Elasticsearch](https://en.wikipedia.org/wiki/Elasticsearch) is a search engine based on the Lucene library.

This image contains the Elasticsearch server with the
[org.wikimedia.search/extra](https://central.sonatype.com/artifact/org.wikimedia.search/extra)
and
[org.wikimedia.search.highlighter/experimental-highlighter-elasticsearch-plugin](https://central.sonatype.com/artifact/org.wikimedia.search.highlighter/experimental-highlighter-elasticsearch-plugin)
plugins for [Wikibase](https://wikiba.se).

> 💡 This image is part of Wikibase Suite (WBS). [WBS Deploy](https://github.com/wmde/wikibase-release-pipeline/deploy/README.md) provides everything you need to self-host a Wikibase instance out of the box.

## Requirements

In order to run Wikibase Elasticsearch, you need:

- MediaWiki/Wikibase instance

### MediaWiki/Wikibase instance

We suggest using the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase) because this is the image we
run all our tests against. Follow the setup instructions over there to get it up and running.

Be sure to add the `ELASTICSEARCH_HOST` environment variable to your Wikibase container.

## Example

You can use the following example Docker Compose configuration to setup and run the image. Your Wikibase will be available on [http://localhost](http://localhost).

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
      MW_ADMIN_EMAIL: "admin@wikibase.example"
      MW_WG_SERVER: http://localhost
      DB_SERVER: mysql:3306
      DB_NAME: "my_wiki"
      DB_USER: "mariadb-user"
      DB_PASS: "change-this-password"
      ELASTICSEARCH_HOST: elasticsearch
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: /healthcheck.sh
      interval: 10s
      start_period: 5m

  wikibase-jobrunner:
    image: wikibase/wikibase
    volumes_from:
      - wikibase
    depends_on:
      wikibase:
        condition: service_healthy
    restart: always
    environment:
      IS_JOBRUNNER: true

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

  elasticsearch:
    image: wikibase/elasticsearch
    restart: unless-stopped
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    environment:
      discovery.type: single-node
      ES_JAVA_OPTS: -Xms512m -Xmx512m -Dlog4j2.formatMsgNoLookups=true
    healthcheck:
      test: /healthcheck.sh
      interval: 10s
      start_period: 2m

volumes:
  wikibase-image-data:
  mysql-data:
  elasticsearch-data:
```

## Releases

Official releases of this image can be found on [Docker Hub wikibase/elasticsearch](https://hub.docker.com/r/wikibase/elasticsearch).

## Tags and Versioning

This Elasticsearch image is using [semantic versioning](https://semver.org/spec/v2.0.0.html).

We provide several tags that relate to the versioning semantics.

| Tag                                             | Example                   | Description                                                                                                                                                                                                                                |
| ----------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| _MAJOR_                                         | 3                         | Tags the latest image with this major version. Gets overwritten whenever a new version is released with this major version. This will include new builds triggered by base image changes, patch version updates and minor version updates. |
| _MAJOR_._MINOR_                                 | 3.1                       | Tags the latest image with this major and minor version. Gets overwritten whenever a new version is released with this major and minor version. This will include new builds triggered by base image changes and patch version updates.    |
| _MAJOR_._MINOR_._PATCH_                         | 3.1.7                     | Tags the latest image with this major, minor and patch version. Gets overwritten whenever a new version is released with this major, minor and patch version. This only happens for new builds triggered by base image changes.            |
| _MAJOR_._MINOR_._PATCH_\_es*ES-VERSION*         | 3.1.7_es7.20.2            | Same as above, but also mentioning the current Elasticsearch version.                                                                                                                                                                      |
| _MAJOR_._MINOR_._PATCH_\_build*BUILD-TIMESTAMP* | 3.1.7_build20240530103941 | Tag that never gets overwritten. Every image will have this tag with a unique build timestamp. Can be used to reference images explicitly for reproducibility.                                                                             |

## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/elasticsearch/Dockerfile).

## Authors & Contact

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not listed above or need help, use this [bug report
form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start
a conversation with the engineering team.
