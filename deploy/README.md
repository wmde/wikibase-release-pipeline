# Wikibase Suite Deploy

Wikibase Suite (WBS) Deploy is a containerized, production-ready [Wikibase](https://wikiba.se) system that allows you to self-host a knowledge graph similar to [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). In addition to Wikibase on MediaWiki, WBS Deploy includes the Wikidata Query Service (WDQS), QuickStatements, Elasticsearch, and a Traefik reverse proxy with SSL termination and ACME support. The service orchestration is implemented using docker-compose. 

> 🔧 This document is for people wanting to self-host the full Wikibase Suite using Wikibase Suite Deploy. If you are looking for individual WBS Images, head over to [hub.docker.com/u/wikibase](https://hub.docker.com/u/wikibase).

> 💡 This document presumes familiarity with basic Linux administration tasks and with Docker/docker-compose.

## What's in the box?

WBS Deploy consists of the following services:

- **[Wikibase](https://hub.docker.com/r/wikibase/wikibase)** MediaWiki packaged with the Wikibase extension and other commonly used extensions.
- **Job Runner** The MediaWiki [JobRunner](https://www.mediawiki.org/wiki/Manual:Job_queue#Cron) service which uses the same Wikibase container as above.
- **[MariaDB](https://hub.docker.com/_/mariadb)** Database service for MediaWiki and Wikibase.
- **[Elasticsearch](https://hub.docker.com/r/wikibase/elasticsearch)** Search service used by MediaWiki.
- **[WDQS](https://hub.docker.com/r/wikibase/wdqs)** Wikidata Query Service to process SPARQL queries.
- **[WDQS Frontend](https://hub.docker.com/r/wikibase/wdqs-frontend)** Web front end for SPARQL queries.
- **[WDQS Proxy](https://hub.docker.com/r/wikibase/wdqs-proxy)** A middle layer for WDQS which serves to filter requests and make the service more secure.
- **[WDQS Updater](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual#runUpdate.sh)** Keeps the WDQS data in sync with Wikibase.
- **[Quickstatements](https://hub.docker.com/r/wikibase/quickstatements)** A web-based tool to import and manipulate large amounts of data.
- **[Traefik](https://hub.docker.com/_/traefik)** A reverse proxy that handles TLS termination and SSL certificate renewal through ACME.

## Quickstart

> 💡 If you want to run a quick test on a machine that has no public IP address (such as your local machine), check our [FAQ item](#can-i-host-wikibase-suite-locally) below.

### Requirements

#### Hardware

- Network connection with a public IP address
- AMD64 architecture
- 8 GB RAM
- 4 GB free disk space

#### Software

- Docker 22.0 (or greater)
- Docker Compose 2.10 (or greater)
- git

#### Domain names

You need three DNS records that resolve to your machine's IP address, one for each user facing service.

- Wikibase e.g. "wikibase.example.com"
- QueryService e.g. "query.example.com"
- QuickStatements e.g. "quickstatements.example.com"

### Initial setup

#### Download WBS Deploy

Check out the files from Github, move to the subdirectory `deploy` and check out the latest stable branch.

```sh
git clone https://github.com/wmde/wikibase-release-pipeline
cd wikibase-release-pipeline/deploy
git checkout deploy-3
```

#### Initial configuration

Make a copy of the [configuration template](./template.env) in the `wikibase-release-pipeline/deploy` directory.

```sh
cp template.env .env
```

Follow the instructions in the comments in your newly created `.env` file to set usernames, passwords and domain names.

#### Starting

Run the following command from within `wikibase-release-pipeline/deploy`:

```sh
docker compose up --wait
```

The first start can take a couple of minutes. Wait for your shell prompt to return.

🎉 Congratulations, your Wikibase Suite instance should be up and running. Web interfaces are available over HTTPS (port 443) for the domain names you configured for Wikibase, the WDQS front end and Quickstatements.

> 💡 If anything goes wrong, you can run `docker logs <CONTAINER_NAME>` to see some hopefully helpful error messages.

#### Stopping

To stop, use

```sh
docker compose stop
```

#### Resetting the configuration

Most values set in `.env` are written into the respective containers after you run `docker compose up` for the first time.

If you want to reset the configuration while retaining your existing data:

1. Make any needed changes to the values in the `.env` file copied from `template.env` above. NOTE: Do not change `DB_*` values unless you are also [re-creating the database](#removing-wikibase-suite-completely-with-all-its-data).
2. Delete your `LocalSettings.php` file from the `./config` directory.
3. Remove and re-create containers:

```sh
docker compose down
docker compose up --wait
```

### Advanced configuration
On first launch, WBS Deploy will create files in the `./config` directory alongside your `.env` file, the `docker-compose.yml` and `template.env`. This is your instance configuration. **You own and control those files.** Be sure to include them in your backups.

#### `config/LocalSettings.php`

This file is generated by the [MediaWiki installer script](https://www.mediawiki.org/wiki/Manual:Install.php) and supplemented by the Wikibase container's `entrypoint.sh` script on first launch. Once this file has been generated, you own and control it. This means that not only *can* you make changes, you may *need* to do so for [major version updates](https://www.mediawiki.org/wiki/Manual:Upgrading#Adapt_your_LocalSettings.php). 

If `config/LocalSettings.php` is missing, it triggers the Wikibase container to run the [MediaWiki installer script](https://www.mediawiki.org/wiki/Manual:Install.php). If you need to run the installer again, you can remove the generated `LocalSettings.php` file (but keep a backup just in case!) and restart your instance.

#### `config/wikibase-php.ini`
This is Wikibase's `php.ini` override file, a good place for tuning PHP configuration values. It gets loaded by the Wikibase web server's PHP interpreter.

#### docker-compose.yml
To further customize your instance, you can also make changes to `docker-compose.yml`. To ease updating to newer versions of WBS Deploy, consider putting your customizations into a new file called `docker-compose.override.yml`. If you do this, you'll need to start using the following commands to restart your instance:

```sh
docker compose -f docker-compose.yml -f docker-compose.override.yml down
docker compose -f docker-compose.yml -f docker-compose.override.yml up --wait
```

This way, your changes are kept separate from the original WBS Deploy code.

### Managing your data
Besides [your configuration](#configuring-your-wikibase-suite), it's your data that makes your instance unique. All instance data is stored in [Docker Volumes](https://docs.docker.com/storage/volumes/).

 - `wikibase-image-data`: MediaWiki image and media file uploads
 - `mysql-data`: MediaWiki/Wikibase MariaDB raw database
 - `wdqs-data`: Wikidata Query Service raw database
 - `elasticsearch-data`: Elasticsearch raw database
 - `quickstatements-data`: generated Quickstatements OAuth binding for this MediaWiki instance
 - `traefik-letsencrypt-data`: SSL certificates

#### Back up your data
To back up your data, shut down the instance and dump the contents of all Docker Volumes into `.tar.gz` files.

```sh
docker compose down

for v in \
    wikibase-suite-wikibase_image-data \
    wikibase-suite_mysql-data \
    wikibase-suite_wdqs-data \
    wikibase-suite_elasticsearch-data \
    wikibase-suite_quickstatements-data \
    wikibase-suite_traefik-letsencrypt-data; do
  docker run --rm --volume $v:/backup debian:12-slim tar cz backup > $v.tar.gz
done
```

#### Restore from a backup

To restore the volume backups, ensure your instance has been shut down by running `docker compose down` and populate the Docker Volumes with data from your `.tar.gz` files.

```sh
docker compose down

for v in \
    wikibase-suite-wikibase_image-data \
    wikibase-suite_mysql-data \
    wikibase-suite_wdqs-data \
    wikibase-suite_elasticsearch-data \
    wikibase-suite_quickstatements-data \
    wikibase-suite_traefik-letsencrypt-data; do
  docker volume rm $v 2> /dev/null
  docker volume create $v
  docker run -i --rm --volume $v:/backup debian:12-slim tar xz < $v.tar.gz
done
```

### Updating and versioning

WBS uses [semantic versioning](https://semver.org/spec/v2.0.0.html). The WBS Deploy and all the WBS Images have individual version numbers.

WBS Deploy always references the latest minor and patch releases of the compatible WBS Images' major versions using a special `deploy-MAJOR_VERSION` tag, such as `deploy-3` for Wikibase Deploy Versions 3.X.X. This tag always points to the latest compatible version of all WBS service images. 

#### Example

Let's say the `wikibase` service image version 1.0.0 is the initial version released with WBS Deploy 3.0.0. In that case, the `wikibase` service image carrying the `1.0.0` tag will also carry a `deploy-3` tag. When the `wikibase` service image version is bumped to 1.1.0 for a feature release, a new image is released and tagged with `1.1.0`. The `deploy-3` tag will then be reused and point to the newly released image 1.1.0. 

This way, WBS Deploy always references the latest compatible version by using the same tag. Nothing needs to be updated in WBS Deploy itself. If the `wikibase` service image version gets bumped to 2.0.0, that indicates a breaking change; in this case the new image would not receive the `deploy-3` tag. Instead, a new version of WBS Deploy would be released (in this case 4.0.0) and a new tag `deploy-4` would be used to reference compatible images for this version. 

WBS Deploy may also receive minor and patch updates, but, as noted above, they are not required to update related WBS Images.

#### Minor and patch updates for WBS Images

Because WBS Deploy always references the latest minor and patch releases of compatible WBS Images, non-breaking changes (including security updates) are applied automatically when re-creating Docker containers.

This is always safe to do. Simply run:

```sh
docker compose down
docker compose up --wait
```
> 💡 In order to **prevent** new versions of WBS Images being pulled on container restart, stop your containers using `docker compose stop` instead of `docker compose down`, which will keep the current containers intact. Note: this stops security updates from being applied. It is generally recommended to use `docker compose down`, which removes the containers and allows updates to be applied.

#### Minor and patch updates for WBS Deploy

WBS Deploy major versions are tracked in dedicated branches such as `deploy-3`. Pulling from the major version branch you are currently on will only update minor and patch versions and will never trigger breaking changes.

These updates are **always** considered safe.

If you did not change `docker-compose.yml`, you can update simply by running `git pull`.

```sh
git pull
```
> 💡 If you have made changes to `docker-compose.yml`, commit them to a separate branch and merge them with upstream changes as you see fit.

> 💡 Each major version of WBS Deploy always references exactly one major version of each of the WBS Images. Thus, updating WBS Deploy minor and patch versions from a major version's git branch will never lead to breaking changes in WBS service images.

#### Major upgrades

Major version upgrades are performed by updating WBS Deploy's major version. This is done by changing your git checkout to the new major version branch. This may reference new major versions of WBS Images or involve breaking changes. In turn, those may require additional steps as described below.

WBS only supports updating from one major version to the next version in sequence. In order to upgrade from 1.x.x to 3.x.x, you must first upgrade from 1.x.x to 2.x.x and then to 3.x.x.

##### Bring down your instance

```sh
docker compose down
```

##### Back up your data and config

[Create a backup](#backup-your-data) of your data.

Back up your `./config` directory as well using:
```
cp -r ./config ./config-$(date +%Y%M%d%H%M%S)
```

> 💡 If you made changes to `docker-compose.yml`, commit them to a separate branch and merge them as you see fit in the next step.

##### Pull new version

WBS Deploy major versions are tracked in separate branches called `deploy-MAJOR_VERSION`, such as `deploy-2` or `deploy-3`. Change your checkout to the new major version branch.

```sh
git remote update
git checkout deploy-MAJOR_VERSION
git pull
```

> 💡 If you made changes to `docker-compose.yml`, merge them as you see fit.

##### Apply any changes to .env

Look for changes in the new `template.env` that you might want to apply to your `.env` file.

##### Apply any migrations for your version

<details><summary><strong>WBS Deploy 2.x.x to 3.x.x (MediaWiki 1.41 to MediaWiki 1.42)</strong></summary><p>

Read the [MediaWiki UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_42/UPGRADE).

No Wikibase-specific migrations are necessary.

</p></details>

<details><summary><strong>WBS Deploy 1.x.x to 2.x.x (MediaWiki 1.39 to MediaWiki 1.41)</strong></summary><p>

Read the [MediaWiki UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_41/UPGRADE).

No Wikibase-specific migrations are necessary.

</p></details>

##### Bring your instance back up

```
docker compose up --wait
```

#### Automatic updates

At the moment, WBS Deploy does not support automatic updates. To automatically deploy minor and patch updates including security fixes to your WBS Images, [restart your instance](#minor-and-patch-updates-for-wbs-service-containers) on a regular basis with a systemd timer, cron job, or similar.

#### Downgrades

Downgrades are not supported. In order to revert an update, restore your data from a backup made prior to the upgrade.

### Removing Wikibase Suite Completely with all its Data

‼️ **This will destroy all data! [Back up](#back-up-your-data) anything you wish to retain.**

To reset the configuration and data, remove the Docker containers, Docker volumes and the generated `config/LocalSettings.php` file.

```sh
docker compose down --volumes
rm config/LocalSettings.php
```

Removing the `traefik-letsencrypt-data` volume will request a new certificate from LetsEncrypt on the next launch of your instance. Certificate generation on LetsEncrypt is [rate-limited](https://letsencrypt.org/docs/rate-limits/). Eventually, you may be blocked from generating new certificates **for multiple days**. To avoid that outcome, change to the LetsEncrypt staging server by appending the following line to the `traefik` `command` stanza of your `docker-compose.yml` file:
```yml
      --certificatesresolvers.letsencrypt.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory
```
## FAQ

### Can I host Wikibase Suite locally?

Yes, Wikibase Suite can be hosted locally for testing purposes by using the example domain names `*.example.com` from `template.env` in your `.env` file. Configure those domains in `/etc/hosts` to make them resolve to `127.0.0.1`.

However, due to OAuth requirements, QuickStatements may not function properly without publicly accessible domain names for both the `WIKIBASE_PUBLIC_HOST` and `QUICKSTATEMENTS_PUBLIC_HOST`. Also, running locally without publicly accessible addresses will prevent the generation of a valid SSL certificate; to accessing locally running services, you will need to allow the invalid certificate when loading the page for the first time.

### Can I migrate from another Wikibase installation to WBS Deploy?

It is possible to migrate an existing Wikibase installation to WBS Deploy. The general procedure is as follows:

 - [Back up your MediaWiki](https://www.mediawiki.org/wiki/Manual:Backing_up_a_wiki)
 - [Install Wikibase Suite](#initial-setup) as described above
 - Re-apply any [changes](#customizing-your-wikibase-suite-mediawiki) to `config/LocalSettings.php`
 - Import your database dump
 - Regenerate the WDQS database
 - Regenerate the Elasticsearch database

### Do you recommend any VPS hosting providers?

As of this writing, we can offer no specific recommendations for VPS providers to host Wikibase Suite. The suite has been tested successfully on various providers; as long as the [minimum technical requirements](#hardware) are met, it should run as expected.

### Where can I get further help?

If you have questions not listed above or need help, use this [bug report form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start a conversation with the engineering team.
