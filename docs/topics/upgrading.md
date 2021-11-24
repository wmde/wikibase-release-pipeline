# Upgrading wikibase docker images

## Back up your database

In all of our images we rely on a database to persist data. Normally these are stored in Docker volumes and can be seen in the mysql container in the Docker example as `mediawiki-mysql-data`.

```yml
  mysql:
    image: "${DEFAULT_DATABASE_IMAGE_NAME}"
    restart: unless-stopped
    volumes:
      - mediawiki-mysql-data:/var/lib/mysql
```

Under ideal circumstances, a backup isn't necessary to upgrade to a new version; however, there is always the possibility of something going wrong, and having a backup is always a good idea.

In the next section we describe two different ways of backing up and restoring your database and Docker volumes.

### 1.1 Backing up/restoring database using [mysqldump](https://mariadb.com/kb/en/mysqldump/)

To back up your data:

```sh
docker exec <DATABASE_CONTAINER_NAME> mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > backup.sql
```

To restore your data:

```sh
docker exec <DATABASE_CONTAINER_NAME> mysql -u $DB_USER -p$DB_PASS $DB_NAME < backup.sql
```

### 1.2 Backing up/restoring volumes using [loomchild/volume-backup](https://hub.docker.com/p/loomchild/volume-backup)

Determine the name of your Docker database volume:

```sh
docker volume ls
DRIVER    VOLUME NAME
local     wikibase_mediawiki-mysql-data
```

To back up your volume:

```sh
docker run -v wikibase_mediawiki-mysql-data:/volume -v /tmp/wikibase-data:/backup --rm loomchild/volume-backup backup mediawiki-mysql-data
```

The above command will produce an archive of the volume named `mediawiki-mysql-data.tar.bz2` in `/tmp/wikibase-data`.

To restore your volume:

```sh
docker run -v wikibase_mediawiki-mysql-data:/volume -v /tmp/wikibase-data:/backup --rm loomchild/volume-backup restore mediawiki-mysql-data
```

## Back up other data
### 1.1 Copy your LocalSettings.php file

If you haven't mounted your own LocalSettings.php file, located in `/var/www/html/LocalSettings.php`, you run the risk of losing this important file when upgrading.

Copy the file to `/tmp/LocalSettings.php` by running:

```sh
docker cp <WIKIBASE_CONTAINER_NAME>:/var/www/html/LocalSettings.php /tmp/LocalSettings.php
```

### 1.2 Review old LocalSettings.php file

Review your old LocalSettings.php file for any changes that the [new version](../../Docker/build/Wikibase/LocalSettings.php.template) may require.

### 1.3 Mount your LocalSettings.php file in the new container

If you aren't already mounting your LocalSettings file at `/var/www/html/LocalSettings.php`, the Docker [entrypoint](../../Docker/build/Wikibase/entrypoint.sh) script will assume that your instance is a fresh install. In that case it wil create one for you and try to run the install scripts.

To prevent this from happening during your upgrade, you must mount your LocalSettings file before using the new image. In your docker-compose.yml, make sure you see a line like the following:

```yml
services:
  wikibase:
    volumes:
      - /home/user/LocalSettings.php:/var/www/html/LocalSettings.php
```
### 2. Copy other data written inside container

In some newer images, the default value of upload images is written inside the container at `/var/www/html/images`. Review your configuration and make backups of any logs or other data that you wish to save.

## Change the image

Update the entry in the `image` section of your `docker-compose.yml` file to the new version. You can also do this by changing the environment variable in your `.env` file, as seen in the Docker example.

```yml
services:
  wikibase:
    image: wikibase/wikibase:1.35.2-wmde.1
```

## Update

At last it's time to run the mediawiki [update.php](https://www.mediawiki.org/wiki/Manual:Update.php) script.

You can do this from outside the Docker container by running:

```
docker exec <WIKIBASE_CONTAINER_NAME> php /var/www/html/maintenance/update.php
```

Running this command will execute the MediaWiki Updater. After it has completed, your upgrade should be successful!


For more information on upgrading, consult addshore's [blog post](https://addshore.com/2019/01/wikibase-docker-mediawiki-wikibase-update/) describing how it was done for the [wikibase registry](https://wikibase-registry.wmflabs.org) (which has custom extensions installed).
