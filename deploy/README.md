# Wikibase Suite Deploy

Wikibase Suite (WBS) Deploy is a containerized, production-ready [Wikibase](https://wikiba.se) system that allows you to self-host a knowledge graph similar to [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). 

WBS Deploy consists of the following services:

- **[Wikibase](https://hub.docker.com/r/wikibase/wikibase):** MediaWiki packaged with the Wikibase extension and other commonly used extensions.
- **Job Runner:** The MediaWiki [JobRunner](https://www.mediawiki.org/wiki/Manual:Job_queue#Cron) service which uses the same Wikibase container as above.
- **[MariaDB](https://hub.docker.com/_/mariadb):** Database service for MediaWiki and Wikibase.
- **[Elasticsearch](https://hub.docker.com/r/wikibase/elasticsearch):** Search service used by MediaWiki.
- **[WDQS](https://hub.docker.com/r/wikibase/wdqs):** Wikidata Query Service to process SPARQL queries.
- **[WDQS Frontend](https://hub.docker.com/r/wikibase/wdqs-frontend)** Web front end for SPARQL queries.
- **[WDQS Updater](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual#runUpdate.sh):** Keeps the WDQS data in sync with Wikibase.
- **[Quickstatements](https://hub.docker.com/r/wikibase/quickstatements):** A web-based tool to import and manipulate large amounts of data.
- **[Traefik](https://hub.docker.com/_/traefik):** A reverse proxy that handles TLS termination and SSL certificate renewal through ACME.

The service orchestration is implemented using Docker Compose V2.

> 🔧 This document is for people wanting to self-host the full Wikibase Suite using Wikibase Suite Deploy. If you are looking for individual WBS images, head over to [hub.docker.com/u/wikibase](https://hub.docker.com/u/wikibase).

> 💡 This document presumes familiarity with basic Linux administration tasks and with [Docker](https://docs.docker.com/get-started/) and [Docker Compose](https://docs.docker.com/compose/).

### Requirements

#### Hardware

- Network connection with a public IP address
- x86_64 (AMD64) architecture
- 8 GB RAM
- 4 GB free disk space

#### Software

- Docker 22.0 or greater ([upgrading documentation]())
- Docker Compose 2.10 or greater ([upgrading documentation]())
- [git](https://git-scm.com/install/) 

#### Domain names

You need two DNS records that resolve to your machine's IP address:

- Wikibase, e.g., "wikibase.example"
- QueryService, e.g., "query.wikibase.example"

## Setup

> 💡 If you want to run a quick test on a machine that has no public IP address (such as your local machine), check our [FAQ entry](#can-i-host-wbs-deploy-locally) below.

### Download WBS Deploy

Check out the files from Github, move to the subdirectory `deploy`.

```sh
git clone https://github.com/wmde/wikibase-release-pipeline
cd wikibase-release-pipeline/deploy
```

### Initial configuration

Make a copy of the [configuration template](./template.env) in the `wikibase-release-pipeline/deploy` directory.

```sh
cp template.env .env
```

> Please follow the instructions in the comments in your newly created `.env` file to set domain names, usernames and passwords. We would also like to bring your attention to our [Call Back](#call-back) feature which you can opt-in here.

### Starting

Run the following command from within `wikibase-release-pipeline/deploy`:

```sh
docker compose up
```

The first start can take a couple of minutes. You can check the status of the stack by running `docker ps` from another terminal. When your WBS Deploy instance is ready, the `wbs-deploy-wikibase-1` container will be marked `healthy`.

🎉 Congratulations! You can now access your instance via https://wikibase.example. Make sure to adjust your domain name accordingly.

> 💡 If anything goes wrong, you can run `docker logs <CONTAINER_NAME>` to see some helpful error messages. In case you run into some issues in this step, please make sure to [reset the configuration] (#resetting-the-configuration) after fixing the error.

### Stopping

To stop, use

```sh
docker compose stop
```

### Resetting the configuration

Most values set in `.env` are written into the respective containers after you run `docker compose up` for the first time.

If you want to reset the configuration while retaining your existing data:

1. Make any needed changes to the values in `.env`.
   NOTE: Do not change `DB_*` values unless you are also [re-creating the database](#removing-wikibase-suite-completely-with-all-its-data).
2. Remove your `LocalSettings.php` file from the `deploy/config` directory. (Create a backup if you made any changes.)
3. Remove and re-create containers:

```sh
docker compose down
docker compose up
```

## Reference Links

Here are some supporting links:
* [Updating Documentation](./updating-and-versioning.md)
* [Advanced Configuration](./advanced-configuration.md)
* [FAQs](./FAQs.md)

## Call Back

The Wikibase Suite Wikibase Image has a Call Back feature. This initiative will help maintain an index of Wikibases. The goal of this index is to gather more quantitative data to learn more about how Wikibase is being used. It eventually also aims to be a central hub for data re-use and federation initiatives between Wikibases, where users can discover other Wikibases easily. In the near future, we expect to have a proper showcase of all the Wikibases that have opted in so as to increase discoverability. For now, however, this data will remain only with Wikimedia Deutschland.

You can join this initiative by setting `METADATA_CALLBACK=true` or disable the feature by setting `METADATA_CALLBACK=false` in your `.env` file. If you enable the feature, your hostnames configured in `.env` will be shared and added to the list. We will then be able to periodically analyze publicly available information on your Wikibase instance. It is important to note that we can only access publicly visible information. If your Wikibase instance requires a login to view data, we will not be able to collect statistics.

You can disable the feature at any time by setting `METADATA_CALLBACK=false` in your `.env` file and by sending an E-Mail to [wikibase-suite-support@wikimedia.de](mailto:wikibase-suite-support@wikimedia.de) containing your hostname to remove your instance from the listing and stop periodic analysis.
 
Let's build the Linked Open Data Web together!

## Removing Wikibase Suite Completely with all its Data

‼️ **This will destroy all data! [Back up](#back-up-your-data) anything you wish to retain.**

To reset the configuration and data, remove the Docker containers, Docker volumes and the generated `deploy/config` files.

```sh
docker compose down --volumes
rm -vf config/{LocalSettings.php,wikibase-php.ini,wdqs-frontend-config.json}
```

Removing the `traefik-letsencrypt-data` volume will request a new certificate from LetsEncrypt on the next launch of your instance. Certificate generation on LetsEncrypt is [rate-limited](https://letsencrypt.org/docs/rate-limits/); eventually you may be blocked from generating new certificates **for multiple days**. To avoid that outcome, change to the LetsEncrypt staging server by appending the following line to the `traefik` `command` stanza of your `docker-compose.yml` file:

```yml
--certificatesresolvers.letsencrypt.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory
```

## WDQS

To interact with the WDQS via the web front end, navigate to the URL defined as `WDQS_PUBLIC_HOST` in the `.env` file. By default, this is set to `query.wikibase.example`.

Alternatively, send `GET` requests with your SPARQL query to the WDQS API endpoint: `https://query.wikibase.example/sparql?query={SPARQL}`
