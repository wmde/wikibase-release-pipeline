# Example

Here's an example of how to run this image together with the [WBS Wikibase image](https://hub.docker.com/r/wikibase/wikibase) using Docker Compose.

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
    volumes_from:
      - wikibase
    command: /jobrunner-entrypoint.sh
    depends_on:
      wikibase:
        condition: service_healthy
    restart: always

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
