# Wikibase Suite WDQS Proxy Image

Proxy to put in front of the WBS WDQS Image enforcing READONLY requests, query timeouts and limits access to blazegraph sparql endpoints.

> 💡 This image is part of Wikibase Suite (WBS). [WBS Deploy](https://github.com/wmde/wikibase-release-pipeline/deploy/README.md) provides everything you need to self-host a Wikibase instance out of the box.

## Requirements

In order to run WDQS Proxy, you need:

- at least 2 GB RAM to start WDQS
- MediaWiki/Wikibase instance
- WDQS as server
- WDQS as updater
- Configuration via environment variables

### MediaWiki/Wikibase instance

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase) because this is the image we
run all our tests against. Follow the setup instructions over there to get it up and running.

### WDQS as server

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wdqs).

### WDQS as updater

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wdqs), the same as used for WDQS server. Checkout the documentation how to run it in updater mode.

## Environment variables

| Variable                 | Default     | Description                  |
| ------------------------ | ----------- | ---------------------------- |
| `PROXY_PASS_HOST`        | "wdqs:9999" | Where to forward requests to |
| `PROXY_MAX_QUERY_MILLIS` | 60000       | Timeout in milliseconds      |

## Example

An example how to run this image together with the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase) and [WBS WDQS Image](https://hub.docker.com/r/wikibase/wdqs) using Docker Compose.

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
    image: mariadb:11.4
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

## Releases

Official releases of this image can be found on [Docker Hub wikibase/wdqs-frontend](https://hub.docker.com/r/wikibase/wdqs-frontend).

## Tags and Versioning

This WDQS Frontend Image is using [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

We provide several tags that relate to the versioning semantics.

| Tag                                             | Example                   | Description                                                                                                                                                                                                                                |
| ----------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| _MAJOR_                                         | 3                         | Tags the latest image with this major version. Gets overwritten whenever a new version is released with this major version. This will include new builds triggered by base image changes, patch version updates and minor version updates. |
| _MAJOR_._MINOR_                                 | 3.1                       | Tags the latest image with this major and minor version. Gets overwritten whenever a new version is released with this major and minor version. This will include new builds triggered by base image changes and patch version updates.    |
| _MAJOR_._MINOR_._PATCH_                         | 3.1.7                     | Tags the latest image with this major, minor and patch version. Gets overwritten whenever a new version is released with this major, minor and patch version. This only happens for new builds triggered by base image changes.            |
| _MAJOR_._MINOR_._PATCH_\_build*BUILD-TIMESTAMP* | 3.1.7_build20240530103941 | Tag that never gets overwritten. Every image will have this tag with a unique build timestamp. Can be used to reference images explicitly for reproducibility.                                                                             |



## Internal filesystem layout

Hooking into the internal filesystem can be used to extend the functionality of this image.

| File                              | Description                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `/etc/nginx/conf.d/wdqs.template` | Template for the nginx config (substituted to `/etc/nginx/conf.d/default.conf` at runtime)                |
| `/etc/nginx/conf.d/default.conf`  | nginx config. To override this you must also use a custom entrypoint to avoid the file being overwritten. |


## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/WDQS/Dockerfile).

## Authors & Contact

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not listed above or need help, use this [bug report
form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start
a conversation with the engineering team.
