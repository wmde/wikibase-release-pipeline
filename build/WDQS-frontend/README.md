## Wikibase Suite Wikidata Query Service Frontend Image

Frontend for the [Wikidata Query Service (WDQS)](https://www.mediawiki.org/wiki/Wikidata_Query_Service).

> 💡 This image is part of Wikibase Suite (WBS). [WBS Deploy](https://github.com/wmde/wikibase-release-pipeline/deploy/README.md) provides everything you need to self-host a Wikibase instance out of the box.

## Requirements

In order to run WDQS Frontend, you need:

- at least 2 GB RAM to start WDQS
- MediaWiki/Wikibase instance
- WDQS as server
- WDQS as updater
- Reverse proxy (if Wikibase and WDQS Frontend are running on the same host)
- Configuration via environment variables

### MediaWiki/Wikibase instance

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase) because this is the image we
run all our tests against. Follow the setup instructions over there to get it up and running.

### WDQS as server

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wdqs).

### WDQS as updater

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wdqs), the same as used for WDQS server. Checkout the documentation how to run it in updater mode.

### Reverse proxy

If QuickStatements and Wikibase are running on the same IP address, a reverse
proxy is required to route HTTP requests to Wikibase or QuickStatements
depending on the URL used to access them. See the [example](#Example) below for
a reverse proxy setup using [Traefik](https://doc.traefik.io/traefik/).

### Environment variables

| Variable        | Default                      | Description                              |
| --------------- | ---------------------------- | ---------------------------------------- |
| `LANGUAGE`      | "en"                         | Language to use in the UI                |
| `BRAND_TITLE`   | "DockerWikibaseQueryService" | Name to display on the UI                |
| `WIKIBASE_HOST` | "wikibase"                   | Hostname of the Wikibase host (required) |
| `WDQS_HOST`     | "wdqs"                       | Hostname of the WDQS host                |
| `WDQS_PORT`     | "9999"                       | Port of the WDQS host                    |
| `COPYRIGHT_URL` | "undefined"                  | URL for the copyright notice             |

## Example

An example how to run this image together with the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase) and [WBS WDQS Image](https://hub.docker.com/r/wikibase/wdqs) behind a [Traefik](https://hub.docker.com/_/traefik) reverse proxy using Docker Compose.

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

  wdqs-frontend:
    image: wikibase/wdqs-frontend
    depends_on:
      - wdqs-proxy
    restart: unless-stopped
    ports:
      - 8834:80
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.wdqs-frontend.rule=Host(`query.example.com`)"
      - "traefik.http.routers.wdqs-frontend.entrypoints=websecure"
      - "traefik.http.routers.wdqs-frontend.tls.certresolver=letsencrypt"
    environment:
      WDQS_HOST: wdqs-proxy
    healthcheck:
      test: curl --silent --fail localhost
      interval: 10s
      start_period: 2m

  traefik:
    image: traefik:v2.5
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      - "--entrypoints.web.http.redirections.entrypoint.permanent=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - 80:80
      - 443:443
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-letsencrypt-data:/letsencrypt


volumes:
  wikibase-image-data:
  mysql-data:
  wdqs-data:
  traefik-letsencrypt-data:
```

## Releases

Official releases of this image can be found on [Docker Hub wikibase/wdqs-frontend](https://hub.docker.com/r/wikibase/wdqs-frontend).

## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/WDQS-frontend/Dockerfile).

## Authors

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not listed above or need help, use this [bug report form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start a conversation with the engineering team.
