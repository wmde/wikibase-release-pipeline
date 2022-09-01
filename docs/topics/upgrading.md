# Upgrading wikibase docker images

This document describes the process that can be applied when backing up and upgrading your Wikibase base and bundle images.

# Back up your data

Always back up your data before attempting an upgrade! Backing up the database is **NOT** sufficient to restore a failed upgrade. Remember that any content in the containers, in particular the `/var/www/html/LocalSettings.php` file is generated at startup and is at **risk of being lost once the old containers are removed!**
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

Remember that `/tmp/` gets cleaned up between restarts.

### 1.2 Review old LocalSettings.php file

Review your old LocalSettings.php file for any changes that the [new version](../../Docker/build/Wikibase/LocalSettings.php.template) may require.

### 1.3 Mount your LocalSettings.php file in the container

If you aren't already mounting your LocalSettings.php file at `/var/www/html/LocalSettings.php`, the Docker [entrypoint](../../Docker/build/Wikibase/entrypoint.sh) script will assume that your instance is a fresh install. In this case it will create one for you and try to run the install scripts.

To prevent this from happening during your upgrade, you must mount your LocalSettings file before using the new image. In your docker-compose.yml, make sure you see a line like the following pointing to your copy of the `LocalSettings.php` file.

```yml
services:
  wikibase:
    volumes:
      - /tmp/LocalSettings.php:/var/www/html/LocalSettings.php
```
### 2. Copy other data written inside container

In some newer images, the default value of upload images is written inside the container at `/var/www/html/images`. Review your configuration and make backups of any logs or other data that you wish to save.

# Do the upgrade
## Stop the running containers

Before we do the actual upgrade, we need to stop the containers and remove the volume that is shared between the `wikibase` and `wikibase_jobrunner` containers.

### Review the mounts currently used by the wikibase container

```sh
docker inspect -f '{{ .Mounts }}' <WIKIBASE_CONTAINER_ID>
```

Example output

```sh
$ docker inspect -f '{{ .Mounts }}' 916ac3ce384e
[ {volume example_shared /var/lib/docker/volumes/example_shared/_data /var/www/html local rw true } ]
```

The above example returns a single mount used by the container called `example_shared`; this is the one that is shared between the jobrunner and the Wikibase web container.

We need to remember this name as we will have to remove it manually after the containers has been shut down and removed.

1. Stop the containers

```sh
docker-compose stop wikibase wikibase_jobrunner
```

2. Remove the containers

```sh
docker-compose rm wikibase wikibase_jobrunner
```

3. Finally, remove the shared container

```sh
docker volume rm example_shared
```

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
