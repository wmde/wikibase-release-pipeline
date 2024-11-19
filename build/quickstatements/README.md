# Wikibase Suite QuickStatements Image

[QuickStatements](https://github.com/magnusmanske/quickstatements) is a tool to batch-edit [Wikibase](https://www.mediawiki.org/wiki/Wikibase).

This image contains Quickstatements and the required Magnustools library. It is ready to be hooked up to MediaWiki OAuth on a WBS Wikibase image.

> 💡 This image is part of Wikibase Suite (WBS). [WBS Deploy](https://github.com/wmde/wikibase-release-pipeline/deploy/README.md) provides everything you need to self-host a Wikibase instance out of the box.

## Requirements

- MediaWiki/Wikibase instance with
  [OAuth](https://www.mediawiki.org/wiki/Extension:OAuth) enabled
- QuickStatements set up as an OAuth consumer on MediaWiki
- Reverse proxy (if Wikibase and QuickStatements are running on the same host)
- DNS domain name resolution for QuickStatements and Wikibase
- Configuration via environment variables

### MediaWiki/Wikibase instance with

#### Official WBS Wikibase image

We suggest to use the [WBS Wikibase image](https://hub.docker.com/r/wikibase/wikibase) because this is the image we run all our tests against. Follow the setup instructions over there to get it up and running.

#### Other Wikibase instances

Any MediaWiki with Wikibase and OAuth extensions should work, but the setup needs to be done manually:

```sh
php /var/www/html/extensions/OAuth/maintenance/createOAuthConsumer.php \
        --approve \
        --callbackUrl  "$QUICKSTATEMENTS_PUBLIC_URL/api.php" \
        --callbackIsPrefix true --user "$MW_ADMIN_NAME" --name QuickStatements --description QuickStatements --version 1.0.1 \
        --grants createeditmovepage --grants editpage --grants highvolume --jsonOnSuccess
```

You can pass the consumer and secret token you got from your Wikibase instance to this container using the environment variables `OAUTH_CONSUMER_KEY` and `OAUTH_CONSUMER_SECRET`.

### Reverse proxy

If QuickStatements and Wikibase are running on the same IP address, a reverse proxy is required to route HTTP requests to Wikibase or QuickStatements depending on the URL used to access them. See the [example](#Example) below for a reverse proxy setup using [Traefik](https://doc.traefik.io/traefik/).

### DNS resolution

In order to authorize QuickStatements against Wikibase via OAuth, both services need to be accessible via DNS domain names, both from within the Docker network as well as from the user's browser. The easiest way to archive this is by connecting both Wikibase and Quickstatements to the internet and letting them use public DNS domain names.

### Environment variables

Variables in **bold** are required.

| Variable                         | Default     | Description                                                                                            |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| **`WIKIBASE_PUBLIC_URL`**        | undefined   | Host and port of Wikibase as seen by the user's browser (required)                                     |
| **`QUICKSTATEMENTS_PUBLIC_URL`** | undefined   | Host and port of QuickStatements as seen by the user's browser (required)                              |
| **`OAUTH_CONSUMER_KEY`**         | undefined   | OAuth consumer key (from MediaWiki), required on initial setup, stored in `/quickstatements/data`.     |
| **`OAUTH_CONSUMER_SECRET`**      | undefined   | OAuth consumer secret (from MediaWiki) , required on initial setup, stored in `/quickstatements/data`. |
| `WB_ITEM_NAMESPACE`              | 120         | Wikibase Item namespace                                                                                |
| `WB_PROPERTY_NAMESPACE`          | 122         | Wikibase Property namespace                                                                            |
| `WB_ITEM_PREFIX`                 | "Item:"     | Wikibase Item prefix                                                                                   |
| `WB_PROPERTY_PREFIX`             | "Property:" | Wikibase Property prefix                                                                               |
| `PHP_TIMEZONE`                   | "UTC"       | setting of php.ini date.timezone                                                                       |
| `LANGUAGE_CODE`                  | "en"        | Site language                                                                                          |
| `SITENAME`                       | "wikibase"  | Site name                                                                                              |

## Example

Here's an example of how to run this image together with the [WBS Wikibase image](https://hub.docker.com/r/wikibase/wikibase) using Docker Compose.

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
      - "traefik.http.routers.wikibase.rule=Host(`wikibase.example`)"
      - "traefik.http.routers.wikibase.entrypoints=websecure"
      - "traefik.http.routers.wikibase.tls.certresolver=letsencrypt"
    volumes:
      - ./config:/config
      - wikibase-image-data:/var/www/html/images
      - quickstatements-data:/quickstatements/data
    environment:
      MW_ADMIN_NAME: "admin"
      MW_ADMIN_PASS: "change-this-password"
      MW_ADMIN_EMAIL: "admin@wikibase.example"
      MW_WG_SERVER: https://wikibase.example
      DB_SERVER: mysql:3306
      DB_NAME: "my_wiki"
      DB_USER: "mariadb-user"
      DB_PASS: "change-this-password"
      QUICKSTATEMENTS_PUBLIC_URL: https://quickstatements.example
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

  quickstatements:
    image: wikibase/quickstatements
    depends_on:
      wikibase:
        condition: service_healthy
    restart: unless-stopped
    ports:
      - 8840:80
    volumes:
      - quickstatements-data:/quickstatements/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.quickstatements.rule=Host(`quickstatements.example`)"
      - "traefik.http.routers.quickstatements.entrypoints=websecure"
      - "traefik.http.routers.quickstatements.tls.certresolver=letsencrypt"
    environment:
      WB_PROPERTY_NAMESPACE: 122
      WB_PROPERTY_PREFIX: "Property:"
      WB_ITEM_NAMESPACE: 120
      WB_ITEM_PREFIX: "Item:"
      QUICKSTATEMENTS_PUBLIC_URL: https://quickstatements.example
      WIKIBASE_PUBLIC_URL: https://wikibase.example
    healthcheck:
      test: /healthcheck.sh
      interval: 10s
      start_period: 2m

  traefik:
    image: traefik:3.1
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
      - "--certificatesresolvers.letsencrypt.acme.email=admin@wikibase.example"
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
  quickstatements-data:
  traefik-letsencrypt-data:
```

## Releases

Official releases of this image can be found on [Docker Hub wikibase/quickstatements](https://hub.docker.com/r/wikibase/quickstatements).

## Tags and Versioning

This image uses [semantic versioning](https://semver.org/spec/v2.0.0.html).

We provide several tags that relate to the versioning semantics.

| Tag                                             | Example                   | Description                                                                                                                                                                                                                                |
| ----------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| _MAJOR_                                         | 3                         | Tags the latest image with this major version. Gets overwritten whenever a new version is released with this major version. This will include new builds triggered by base image changes, patch version updates and minor version updates. |
| _MAJOR_._MINOR_                                 | 3.1                       | Tags the latest image with this major and minor version. Gets overwritten whenever a new version is released with this major and minor version. This will include new builds triggered by base image changes and patch version updates.    |
| _MAJOR_._MINOR_._PATCH_                         | 3.1.7                     | Tags the latest image with this major, minor and patch version. Gets overwritten whenever a new version is released with this major, minor and patch version. This only happens for new builds triggered by base image changes.            |
| _MAJOR_._MINOR_._PATCH_\_build*BUILD-TIMESTAMP* | 3.1.7_build20240530103941 | Tag that never gets overwritten. Every image will have this tag with a unique build timestamp. Can be used to reference images explicitly for reproducibility.                                                                             |

## Known Issues

QuickStatements' "Run in background" option is not supported by this image.

QuickStatements' "Batches" require an database and are not supported by this image.

## Troubleshooting

If you see an error such as `mw-oauth exception` when trying to log in, check that you have passed the correct consumer token and secret token to QuickStatements.

If you have changed the value of `$wgSecretKey` or `$wgOAuthSecretKey` since you made the consumer, you'll need to make another new consumer or reissue the secret token for the old one.

## Internal filesystem layout

Hooking into the internal filesystem can extend the functionality of this image.

| Directory                                   | Description                    |
| ------------------------------------------- | ------------------------------ |
| `/healthcheck.sh`                           | Optional healthcheck script    |
| `/var/www/html/quickstatements`             | Base QuickStatements directory |
| `/var/www/html/quickstatements/public_html` | The Apache root folder         |
| `/var/www/html/magnustools`                 | Base magnustools directory     |

| File                     | Description                                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/templates/config.json` | Template for QuickStatements' config.json (substituted to `/var/www/html/quickstatements/public_html/config.json` in `entrypoint.sh`)              |
| `/templates/oauth.ini`   | Template for QuickStatements' oauth.ini (substituted to `/quickstatements/data/oauth.ini` in `entrypoint.sh`)                                      |
| `/templates/php.ini`     | PHP config (default provided sets date.timezone to prevent php complaining substituted to `/usr/local/etc/php/conf.d/php.ini` in `entrypoint.sh` ) |

## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/quickstatements/Dockerfile).

## Authors

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not listed above or need help, use this [bug report form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start a conversation with the engineering team.
