# Wikibase Suite Wikidata Query Service Image

The [Wikidata Query Service (WDQS)](https://www.mediawiki.org/wiki/Wikidata_Query_Service) provides a way for tools to access Wikibase data, via a SPARQL API. It is based on [Blazegraph](https://github.com/blazegraph/database/wiki/Main_Page).

> 💡 This image is part of Wikibase Suite (WBS). [WBS Deploy](https://github.com/wmde/wikibase-release-pipeline/deploy/README.md) provides everything you need to self-host a Wikibase instance out of the box.

## Requirements

In order to run WDQS, you need:

- at least 2 GB RAM to start WDQS
- MediaWiki/Wikibase instance
- WDQS as server
- WDQS as updater
- WDQS Proxy for public facing setups
- Configuration via environment variables

### MediaWiki/Wikibase instance

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase) because this is the image we
run all our tests against. Follow the setup instructions over there to get it up and running.

### WDQS as server

One instance of the image to execute the actual WDQS daemon started using `/runBlazegraph.sh`.

### WDQS as updater

One instance of the image to execute the updater started using `/runUpdate.sh`. This polls changes from Wikibase.

### WDQS Proxy for public facing setups

By default, WDQS exposes some endpoints and methods that reveal internal details or functionality that might allow for abuse of the system. Wikibase Suite offers the [WDQS-proxy](../WDQS-proxy/README.md) which filters out all long-running or unwanted requests.

When running WDQS in a setup without WDQS-proxy, **please consider disabling these endpoints in some other way**.

### Environment variables

Variables in **bold** are required.

| Variable                 | Default    | Description                                                                                                                                                                                                                                                               |
| ------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`WIKIBASE_HOST`**      | "wikibase" | Hostname of the Wikibase service                                                                                                                                                                                                                                          |
| **`WDQS_HOST`**          | "wdqs"     | WDQS hostname (this service)                                                                                                                                                                                                                                              |
| **`WDQS_PORT`**          | "9999"     | WDQS port (this service)                                                                                                                                                                                                                                                  |
| `WIKIBASE_SCHEME`        | "http"     | URL scheme of the Wikibase service                                                                                                                                                                                                                                        |
| `WDQS_ENTITY_NAMESPACES` | "120,122"  | Wikibase namespaces to load data from                                                                                                                                                                                                                                     |
| `WIKIBASE_MAX_DAYS_BACK` | "90"       | Maximum number of days updater can reach back in time from now                                                                                                                                                                                                            |
| `MEMORY`                 | ""         | Memory limit for Blazegraph                                                                                                                                                                                                                                               |
| `HEAP_SIZE`              | "1g"       | Heap size for Blazegraph                                                                                                                                                                                                                                                  |
| `BLAZEGRAPH_EXTRA_OPTS`  | ""         | Extra options to be passed to Blazegraph,they must be prefixed with `-D`. Example: `-Dhttps.proxyHost=http://my.proxy.com -Dhttps.proxyPort=3128`. See [the WDQS User Manual](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual#Configurable_properties). |

## Example

An example how to run this image together with the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase) using Docker Compose.

```yml
services:
  wikibase:
    image: wikibase/wikibase
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped
    ports:
      - 8880:80
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.wikibase.rule=Host(`wikibase.example.com`)"
      - "traefik.http.routers.wikibase.entrypoints=websecure"
      - "traefik.http.routers.wikibase.tls.certresolver=letsencrypt"
    volumes:
      - ./config:/config
      - wikibase-image-data:/var/www/html/images
    environment:
      MW_ADMIN_NAME: "admin"
      MW_ADMIN_PASS: "change-this-password"
      MW_ADMIN_EMAIL: "admin@example.com"
      MW_WG_SERVER: https://wikibase.example.com
      DB_SERVER: mysql:3306
      DB_NAME: "my_wiki"
      DB_USER: "mariadb-user"
      DB_PASS: "change-this-password"
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
      MYSQL_DATABASE: "my_wiki"
      MYSQL_USER: "mariadb-user"
      MYSQL_PASSWORD: "change-this-password"
      MYSQL_RANDOM_ROOT_PASSWORD: yes
    healthcheck:
      test: healthcheck.sh --connect --innodb_initialized
      start_period: 1m
      interval: 20s
      timeout: 5s

  wdqs:
    image: wikibase/wdqs
    command: /runBlazegraph.sh
    depends_on:
      wikibase:
        condition: service_healthy
    restart: unless-stopped
    ulimits:
      nofile:
        soft: 32768
        hard: 32768
    volumes:
      - wdqs-data:/wdqs/data
    healthcheck:
      test: curl --silent --fail localhost:9999/bigdata/namespace/wdq/sparql
      interval: 10s
      start_period: 2m

  wdqs-updater:
    image: wikibase/wdqs
    command: /runUpdate.sh
    depends_on:
      wdqs:
        condition: service_healthy
    restart: unless-stopped
    ulimits:
      nofile:
        soft: 32768
        hard: 32768

  wdqs-proxy:
    image: wikibase/wdqs-proxy
    depends_on:
      wdqs:
        condition: service_healthy
    restart: unless-stopped


volumes:
  wikibase-image-data:
  mysql-data:
  wdqs-data:
```


## Tags and Versioning

This image uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

We provide several tags that relate to the versioning semantics.

| Tag                                             | Example                   | Description                                                                                                                                                                                                                                |
| ----------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| _MAJOR_                                         | 3                         | Tags the latest image with this major version. Gets overwritten whenever a new version is released with this major version. This will include new builds triggered by base image changes, patch version updates and minor version updates. |
| _MAJOR_._MINOR_                                 | 3.1                       | Tags the latest image with this major and minor version. Gets overwritten whenever a new version is released with this major and minor version. This will include new builds triggered by base image changes and patch version updates.    |
| _MAJOR_._MINOR_._PATCH_                         | 3.1.7                     | Tags the latest image with this major, minor and patch version. Gets overwritten whenever a new version is released with this major, minor and patch version. This only happens for new builds triggered by base image changes.            |
| _MAJOR_._MINOR_._PATCH_\_wdqs*WDQS-VERSION*     | 3.1.7_wdqs0.1.317         | Same as above, but also mentioning the current WDQS version.                                                                                                                                                                               |
| _MAJOR_._MINOR_._PATCH_\_build*BUILD-TIMESTAMP* | 3.1.7_build20240530103941 | Tag that never gets overwritten. Every image will have this tag with a unique build timestamp. Can be used to reference images explicitly for reproducibility.                                                                             |
| deploy-_WBS-DEPLOY-VERSION_                     | deploy-3                  | Tags the latest image compatible with the given version of [WBS Deploy](https://github.com/wmde/wikibase-release-pipeline/deploy/README.md).                                                                                               |

## Upgrading

When upgrading between WDQS versions, the data stored in `/wdqs/data` may not be compatible with the newer version. When testing the new image, if no data appears to have been loaded into the Query Service, you'll need to reload the data.

If all changes still appear in [RecentChanges], simply removing `/wdqs/data` and restarting the service should reload all data.

However, [RecentChanges] are periodically purged of older entries, as determined by the MediaWiki configuration [\$wgRCMaxAge](https://www.mediawiki.org/wiki/Manual:$wgRCMaxAge).

If you can't use [RecentChanges], you'll need to reload from an RDF dump:

- [Make an RDF dump from your Wikibase repository using the dumpRdf.php maintenance script.](https://doc.wikimedia.org/Wikibase/master/php/docs_topics_rdf-binding.html)
- [Load the RDF dump into the query service](https://github.com/wikimedia/wikidata-query-rdf/blob/master/docs/getting-started.md#load-the-dump)

### Filesystem layout

| File                         | Description                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `/wdqs/allowlist.txt`        | SPARQL endpoints allowed for federation                                                        |
| `/wdqs/RWStore.properties`   | Properties for the service                                                                     |
| `/templates/mwservices.json` | Template for MediaWiki services (populated and placed into `/wdqs/mwservices.json` at runtime) |

### Known Issues

#### Updater keeps restarting

In some situations the WDQS Updater enters a restart loop. A workaround is to start the updater once with manual `--init` `--start` parameters for the current day.

In the docker compose example provided above, you could do:
```sh
docker compose stop wdqs-updater
docker compose run --rm wdqs-updater bash -c '/wdqs/runUpdate.sh -h http://"$WDQS_HOST":"$WDQS_PORT" -- --wikibaseUrl "$WIKIBASE_SCHEME"://"$WIKIBASE_HOST" --conceptUri "$WIKIBASE_SCHEME"://"$WIKIBASE_HOST" --entityNamespaces "$WDQS_ENTITY_NAMESPACES" --init --start $(date +%Y%m%d000000)'
docker compose start wdqs-updater
```

## Releases

Official releases of this image can be found on [Docker Hub wikibase/wdqs](https://hub.docker.com/r/wikibase/wdqs).

## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/WDQS/Dockerfile).

## Authors & Contact

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not listed above or need help, use this [bug report
form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start
a conversation with the engineering team.
