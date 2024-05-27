# Wikibase Suite

Wikibase Suite is a containerised, production ready [Wikibase](https://wikiba.se) stack, that allows you to self host a knowledge graph similar to Wikidata.

> This document is for people wanting to self host the full Wikibase Suite. If you are looking for documentation about the individual containers provided with Wikibase Suite, head over to https://hub.docker.com/u/wikibase

Wikibase Suite comes with the following services:

- **[Wikibase](https://hub.docker.com/r/wikibase/wikibase)** MediaWiki packaged with the Wikibase extension and other commonly used extensions.
- **Job Runner** The MediaWiki [JobRunner](https://www.mediawiki.org/wiki/Manual:Job_queue#Cron) service which uses the same Wikibase container as above.
- **[MariaDB](https://hub.docker.com/_/mariadb)** Database service for MediaWiki and Wikibase.
- **[Elasticsearch](https://hub.docker.com/r/wikibase/elasticsearch)** Search service used by MediaWiki.
- **[WDQS](https://hub.docker.com/r/wikibase/wdqs)** Wikidata Query Service allowing SPARQL queries.
- **[WDQS Frontend](https://hub.docker.com/r/wikibase/wdqs-frontend)** Web Frontend to run SPARQL queries.
- **[wdqs-proxy](https://hub.docker.com/r/wikibase/wdqs-proxy)** A middle layer for WDQS which serves to filter requests and make the service more secure.
- **[WDQS Updater](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual#runUpdate.sh)** Keeps the WDQS data in sync with Wikibase.
- **[Quickstatements](https://hub.docker.com/r/wikibase/quickstatements)** A web based tool to import and manipulate large amounts of data.
- **[Traefik](https://hub.docker.com/_/traefik)** A reverse proxy handling TLS termination and ACME certificate renewal.

## Quickstart

### Requirements

#### Hardware

- Network connection with a public IP address
- AMD64 architecture
- 8 GB RAM
- 4 GB free disk space
- Docker 22.0, or greater
- Docker Compose 2.10, or greater

#### Domain Names

You need three DNS records that resolve to your machines IP address.

- Wikibase e.g. "wikibase.mydomain.net"
- QueryService e.g. "query.mydomain.net"
- QuickStatements e.g. "quickstatements.mydomain.net"

### Initial setup

### Download required files

Checkout the files from Github.

```
git clone https://github.com/wmde/wikibase-release-pipeline
git checkout wmde.20
cd wikibase-release-pipeline/example
```

### Configuration

Make a copy of the [configuration template](./template.env) in `wikibase-release-pipeline/example`

```
cp template.env .env
```

Set usernames, passwords and domain names in your newly created `.env` file
according to the instructions in the comments.

### Start the stack

Run the following command from within `wikibase-release-pipeline/example`

```
docker compose up --wait
```

The first start of Wikibase Suite can take a couple of minutes. Wait for your shell prompt to return.

### Done

Congratulations, your Wikibase Suite instance should be up and running. Web
interfaces are available via https (port 443) on the domain names you
configured for Wikibase, WDQS Frontend and Quickstatements.

### Stopping Wikibase Suite

To stop Wikibase Suite, use `docker compose down`.

### Resetting Wikibase Suite Configuration

Most values set in `.env` are copied statically into the respective containers after the first time you run `docker compose up --wait`.

To reset the configuration but keep your existing data:

1. Make any needed changes to the values in the `.env` file copied from `template.env` above. NOTE: Do not change `DB_*` values unless you are also re-creating the database (see "Removing Wikibase Suite Completely" below).
2. Delete your LocalSettings.php from the ./config directory.
3. Remove and re-create Wikibase Suite services with:

```
docker compose down
docker compose up --wait
```

### Updating Wikibase Suite with Patch Releases

Patch releases are applied automatically when recreating Docker containers

```
docker compose down && docker compose up --wait`
```

### Upgrading to New Major Releases of Wikibase Suite:

Major releases may require additional steps. Refer to specific upgrade instructions in the Migration Guide section below.

### Removing Wikibase Suite Completely with all its data

To reset the configuration and data, and remove the Wikibase Suite Docker containers. _This will destroy all data, make sure to backup anything you wish to retain_:

```
docker compose down --volumes
```

## Migration Guide

# TODO write

**MediaWiki 1.39 to MediaWiki 1.40:**

- Details on migration steps from MediaWiki version 1.39 to 1.40 are outlined here. Ensure to follow the provided instructions carefully to ensure a smooth transition and compatibility with Wikibase Suite.

**MediaWiki 1.40 to MediaWiki 1.41:**

- Information on migrating from MediaWiki version 1.40 to 1.41 is provided in this section. Any specific upgrade notes or considerations are highlighted to assist in the upgrade process.

[Note: Replace placeholders with actual migration steps and considerations specific to each version upgrade.]

**From an existing MediaWiki installation to Wikibase Suite**

It is possible to migrate an existing MediaWiki installation to the Wikibase Suite Docker images. The process may require some manual configuration and adjustment to match the setup provided by the suite.

## FAQ

### Can I host Wikibase Suite locally?

Yes, Wikibase Suite can be hosted locally for testing purposes. However, due to OAuth requirements, QuickStatements may not function properly without a publicly accessible domain names for both the `WIKIBASE_PUBLIC_HOST` and `QUICKSTATEMENTS_PUBLIC_HOST`. Running locally without publicly accessible addresses will also not generate a valid SSL certificate so accessing services will require allowing the invalid certificate on first load.

### Do you have any recommended Internet host / VPS provider recommendations?

At this time, there are no specific recommendations for Internet hosts or VPS providers for hosting Wikibase Suite. The suite has been tested on various providers, and as long as the minimum technical requirements are met, it should run as expected.

The provided files are for configuring and deploying Wikibase Suite using Docker containers. Wikibase is an extension for MediaWiki that enables the creation and management of structured data, similar to Wikidata. In addition to this configuration of MediaWiki, Wikibase suite includes the Wikidata Query Service (WDQS), QuickStatements, Elasticsearch, and a reverse proxy with SSL services. The configuration is managed through Docker Compose and environment variables.
