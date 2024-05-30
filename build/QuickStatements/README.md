# QuickStatements

[QuickStatements](https://github.com/magnusmanske/quickstatements) is a tool to
batch-edit [Wikibase](https://www.mediawiki.org/wiki/Wikibase).

> 💡 This image is part of Wikibase Suite (WBS). The [WBS Deployment Toolkit](https://github.com/wmde/wikibase-release-pipeline/example/README.md) provides everything including QuickStatements you need to self-host a Wikibase instance out of the box.

## Requirements

- MediaWiki/Wikibase instance with
  [OAuth](https://www.mediawiki.org/wiki/Extension:OAuth) enabled
- QuickStatements set up as an OAuth consumer on MediaWiki
- Reverse proxy (if Wikibase and QuickStatements are running on the same host)
- DNS resolution for QuickStatements and Wikibase
- Configuration via environment variables

### Wikibase instance

Any MediaWiki with Wikibase and OAuth extensions should work.

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase). 
Follow the setup instructions over there to get it up and running.

### OAuth consumer setup on MediaWiki

You can pass the consumer and secret token you got from your Wikibase instance
to this container using the environment variables `OAUTH_CONSUMER_KEY` and
`OAUTH_CONSUMER_SECRET`. Alternatively you can let the [default-extra-install
script](../Wikibase/default-extra-install.sh) supplied in the Wikibase bundle
handle this for you.

TODO: more details here

### Reverse proxy

If QuickStatements and Wikibase are running on the same IP address, a reverse
proxy is required to route HTTP requests to Wikibase or QuickStatements
depending on the URL used to access them.

### DNS resolution

In order to authorize QuickStatements against Wikibase via OAuth, both services
need to be accessible via DNS names, both, from within the docker network as
well as from the users browser.

### Environment variables

Variables in **bold** are required.

| Variable                         | Default    | Description                                                               |
| -------------------------------- | ---------- | ------------------------------------------------------------------------- |
| **`WIKIBASE_PUBLIC_URL`**        | undefined  | Host and port of Wikibase as seen by the user's browser (required)        |
| **`QUICKSTATEMENTS_PUBLIC_URL`** | undefined  | Host and port of QuickStatements as seen by the user's browser (required) |
| `OAUTH_CONSUMER_KEY`             | undefined  | OAuth consumer key (obtained from Wikibase)                               |
| `OAUTH_CONSUMER_SECRET`          | undefined  | OAuth consumer secret (obtained from wikibase)                            |
| `PHP_TIMEZONE`                   | "UTC"      | setting of php.ini date.timezone                                          |
| `MW_WG_LANGUAGE_CODE`            | "en"       | Site language                                                             |
| `MW_WG_SITENAME`                 | "wikibase" | Site name                                                                 |
| `WB_PROPERTY_NAMESPACE`          | undefined  | Wikibase Property namespace                                               |
| `WB_ITEM_NAMESPACE`              | undefined  | Wikibase Item namespace                                                   |
| `WB_PROPERTY_PREFIX`             | undefined  | Wikibase Property prefix                                                  |
| `WB_ITEM_PREFIX`                 | undefined  | Wikibase Item prefix                                                      |

## Example `docker-compose.yml`

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
      - "traefik.http.routers.wikibase.rule=Host(`${WIKIBASE_PUBLIC_HOST}`)"
      - "traefik.http.routers.wikibase.entrypoints=websecure"
      - "traefik.http.routers.wikibase.tls.certresolver=letsencrypt"
    volumes:
      - ./config:/config
      - wikibase-image-data:/var/www/html/images
      - quickstatements-data:/quickstatements/data
    environment:
      MW_ADMIN_NAME: ${MW_ADMIN_NAME}
      MW_ADMIN_PASS: ${MW_ADMIN_PASS}
      MW_ADMIN_EMAIL: ${MW_ADMIN_EMAIL}
      MW_WG_SERVER: https://${WIKIBASE_PUBLIC_HOST}
      DB_SERVER: mysql:3306
      DB_USER: ${DB_USER}
      DB_PASS: ${DB_PASS}
      DB_NAME: ${DB_NAME}
      QUICKSTATEMENTS_PUBLIC_URL: https://${QUICKSTATEMENTS_PUBLIC_HOST}
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
      - "traefik.http.routers.quickstatements.rule=Host(`${QUICKSTATEMENTS_PUBLIC_HOST}`)"
      - "traefik.http.routers.quickstatements.entrypoints=websecure"
      - "traefik.http.routers.quickstatements.tls.certresolver=letsencrypt"
    environment:
      WB_PROPERTY_NAMESPACE: 122
      WB_PROPERTY_PREFIX: "Property:"
      WB_ITEM_NAMESPACE: 120
      WB_ITEM_PREFIX: "Item:"
      QUICKSTATEMENTS_PUBLIC_URL: https://${QUICKSTATEMENTS_PUBLIC_HOST}
      WIKIBASE_PUBLIC_URL: https://${WIKIBASE_PUBLIC_HOST}
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
      - "--certificatesresolvers.letsencrypt.acme.email=${MW_ADMIN_EMAIL}"
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




### Known Issues

The "Run in background" option is not supported by this image.

"Batches" require an database and are not supported by this image.

#### Troubleshooting

If you see an error such as `mw-oauth exception` when trying to log in, check
that you have passed the correct consumer token and secret token to
QuickStatements.

If you have changed the value of $wgSecretKey $wgOAuthSecretKey since you made
the consumer, you'll need to make another new consumer or reissue the secret
token for the old one.

### Internal filesystem layout

Hooking into the internal filesystem can be used to extend the functionality of this image.

| Directory                                   | Description                    |
| ------------------------------------------- | ------------------------------ |
| `/var/www/html/quickstatements`             | Base QuickStatements directory |
| `/var/www/html/quickstatements/public_html` | The Apache root folder         |
| `/var/www/html/magnustools`                 | Base magnustools directory     |

| File                     | Description                                                                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `/templates/config.json` | Template for QuickStatements' config.json (substituted to `/var/www/html/quickstatements/public_html/config.json` at runtime)             |
| `/templates/oauth.ini`   | Template for QuickStatements' oauth.ini (substituted to `/var/www/html/quickstatements/oauth.ini` at runtime)                             |
| `/templates/php.ini`     | php config (default provided sets date.timezone to prevent php complaining substituted to `/usr/local/etc/php/conf.d/php.ini` at runtime) |

## Source

This image is built from [this Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/QuickStatements/Dockerfile).

## Authors

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).
