# Upgrading wikibase docker images

## Backup your database


In all of our images we are relying a database to persist data. Normally these are stored in docker volumes and can be seen in the mysql container in the docker example as `mediawiki-mysql-data`.

```yml
  mysql:
    image: "${DEFAULT_DATABASE_IMAGE_NAME}"
    restart: unless-stopped
    volumes:
      - mediawiki-mysql-data:/var/lib/mysql
```

Ideally you shouldn't have to rely on the backup to upgrade to a new version, however there is the possibility of something going wrong and having a backup is always a good idea.

In the next section we describe two different ways of backing up and restoring your database and docker volumes.

### 1.1 Backing up / restoring database using [mysqldump](https://mariadb.com/kb/en/mysqldump/)

To backup your data

```sh
docker exec <DATABASE_CONTAINER_NAME> mysqldump -u $DBUSER -p$DBPASS $DBNAME > backup.sql
```

To restore your data

```sh
docker exec <DATABASE_CONTAINER_NAME> mysql -u $DBUSER -p$DBPASS $DBNAME < backup.sql
```

### 1.2 Backing up / restoring volumes using [loomchild/volume-backup](https://hub.docker.com/p/loomchild/volume-backup)

Find out the name of your docker volume

```sh
$ docker volume ls
DRIVER    VOLUME NAME
local     wikibase_mediawiki-mysql-data
```

To backup your volume

```sh
docker run -v wikibase_mediawiki-mysql-data:/volume -v /tmp/wikibase-data:/backup --rm loomchild/volume-backup backup mediawiki-mysql-data
```

Will result in a `mediawiki-mysql-data.tar.bz2` archive of the volume in `/tmp/wikibase-data`.

To restore your volume

```sh
docker run -v wikibase_mediawiki-mysql-data:/volume -v /tmp/wikibase-data:/backup --rm loomchild/volume-backup restore mediawiki-mysql-data
```

## Backup other data
### 1.1 Copy your LocalSettings.php file

If you haven't mounted in your own LocalSettings.php file thats placed in `/var/www/html/LocalSettings.php` there is a risk of this getting lost when upgrading.

Make a copy to `/tmp/LocalSettings.php` by running

```sh
docker cp <WIKIBASE_CONTAINER_NAME>:/var/www/html/LocalSettings.php /tmp/LocalSettings.php
```

### 1.2 Review old LocalSettings.php file

Review your old LocalSettings file for any changes that might be required by the [new version](../../Docker/build/Wikibase/LocalSettings.php.template).

### 1.3 Mount your LocalSettings.php file into the new container

Unless you aren't already mounting a LocalSettings file into `/var/www/html/LocalSettings.php` the docker [entrypoint](../../Docker/build/Wikibase/entrypoint.sh) script will assume that your instance is a fresh install and create one for you and try to run the install scripts.

To avoid this we need to make sure to have a LocalSettings file mounted before we use the new image.

```yml
services:
  wikibase:
    volumes:
      - /home/user/LocalSettings.php:/var/www/html/LocalSettings.php
```
### 2. Copy other data written inside container

In some of the newer images the default value of upload images is to be written inside the container at `/var/www/html/images`. Review your configuration and make backups of any logs or other data that you wish to save.

## Change the image

Update the `image` section in your `docker-compose.yml` file to the new version or by changing the environment variable in your `.env` file from the docker example.

```yml
services:
  wikibase:
    image: wikibase/wikibase:1.35.2-wmde.1
```

## Update

Finally it's time to run the mediawiki [update.php](https://www.mediawiki.org/wiki/Manual:Update.php) script.

This can be done from outside the docker container by running

```
docker exec <WIKIBASE_CONTAINER_NAME> php /var/www/html/maintenance/update.php
```

Running this command will execute the MediaWiki Updater. After this has completed your upgrade should've been successful!


For a more reading regarding upgrading there is a [blog post](https://addshore.com/2019/01/wikibase-docker-mediawiki-wikibase-update/) by addshore describing how it was done for the [wikibase registry](https://wikibase-registry.wmflabs.org) which has custom extensions installed.