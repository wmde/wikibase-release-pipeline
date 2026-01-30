# Wikibase Suite Deploy

Wikibase Suite (WBS) Deploy is a containerized, production-ready [Wikibase](https://wikiba.se) system that allows you to self-host a knowledge graph similar to [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). 

This installation guide is to walk you through how to get a production-ready Wikibase and not for local hosting.

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

> [!NOTE]
> This document is for people wanting to self-host the full Wikibase Suite using Wikibase Suite Deploy. If you are looking for individual WBS images, head over to [hub.docker.com/u/wikibase](https://hub.docker.com/u/wikibase). This document presumes familiarity with basic Linux administration tasks and with [Docker](https://docs.docker.com/get-started/) and [Docker Compose](https://docs.docker.com/compose/).

### Index
- [Installation](#installation)
  - [Requirements](#requirements)
  - [Setup](#setup)
  - [Initial Configuration](#initial-configuration)
  - [Starting instance](#starting)
  - [Stopping instance](#stopping)
  - [Resetting the configuration](#resetting-the-configuration)
- [Call Back](#call-back)
- [Updating and Versioning](updating-and-versioning.md)
- [Advanced Configuration](advanced-configuration.md)
- [Managing your data](manage-your-data.md)
- [Frequently Asked Questions](FAQs.md)
- [Removing Wikibase Suite Completely with all its Data](removing-wikibase.md)
- [WDQS](wdqs.md)

---

## Installation

### 1. Requirements

#### Hardware

Here are some official installation guides for commonly used hosting providers:
- [Hetzner](https://docs.hetzner.com/cloud/servers/getting-started/creating-a-server/)
- [Digital Ocean](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu)
- [Akamai](https://techdocs.akamai.com/cloud-computing/docs/set-up-and-secure-a-compute-instance)
- [Vultr](https://docs.vultr.com/products/compute/cloud-compute/provisioning)

These are the minimum requirements for your server: 
- Network connection with a public IP address
- x86_64 (AMD64) architecture
- 8 GB RAM
- 4 GB free disk space

#### Software

- Docker 22.0 or greater ([upgrading documentation](https://docs.docker.com/engine/install/ubuntu/#installation-methods))
- Docker Compose 2.10 or greater ([upgrading documentation](https://docs.docker.com/compose/install/))
- [git](https://git-scm.com/install/) 

#### Domain names

You need two DNS records that resolve to your machine's IP address:

- Wikibase, e.g., "wikibase.example"
- QueryService, e.g., "query.wikibase.example"

> [!NOTE]
> Please note that you only have to set up an A record not AA.

---

### 2. Setup

#### Download WBS Deploy

Check out the files from Github, move to the subdirectory `deploy`.

```sh
git clone https://github.com/wmde/wikibase-release-pipeline
cd wikibase-release-pipeline/deploy
```

---

### 3. Initial configuration

Make a copy of the [configuration template](./template.env) in the `wikibase-release-pipeline/deploy` directory.

```sh
cp template.env .env
```

While you can choose an editor of your choice to make changes to the `.env` file, here is the way to do it using `Vim`:

```sh
vim .env
```

Here are the common commands you will need to edit the file:
* i to enter insert mode (for typing text).
* Esc to return to normal (command) mode.
* :w to save the file.
* :q to quit (fails if changes were made).
* :wq to save and quit.
* :q! to quit without saving. 

#### Editing the File

**a. Call Back:**
This is an initiative to maintain an index of Wikibases. You can find more information [here](#call-back). You need to
set `true` to opt-in and `false` to opt out.

```sh
METADATA_CALLBACK=true
```

> [!NOTE]
> Please note that if you do not set a value, the container will not run successfully.

**b. Public hostname configuration:**
These domain names for your Wikibase Suite services should be configured on your DNS server to point to the public IP address 
of the server being deployed to. Note that you need two distinct names, e.g. two different subdomains. Otherwise the traefik 
reverse proxy cannot route properly.

**c. MediaWiki / Wikibase user configuration:**
Please enter the relevant details.

> [!NOTE]
> Password must be at least 10 characters, different from your username and not appear in the list of commonly used passwords 
> this project uses. If these conditions are not met, the container won't run successfully.

**d. MediaWiki / Wikibase database configuration:**
Those settings are used by the MariaDB container when creating a new database and by MediaWiki when generating a new `LocalSettings.php`. 
They will not be set on an existing database, nor will MediaWiki update those settings in your `LocalSettings.php`. To change those settings, 
either adjust them manually in MariaDB and your LocalSettings.php, or delete your MariaDB volume `mysql-data` and your `LocalSettings.php` 
from the `./config` directory and restart.

---

### 4. Starting

Run the following command from within `wikibase-release-pipeline/deploy`:

```sh
docker compose up
```

The first start can take a couple of minutes. You can check the status of the stack by running `docker ps` from another terminal. When your WBS Deploy instance is ready, the `wbs-deploy-wikibase-1` container will be marked `healthy`.

🎉 Congratulations! You can now access your instance via your domain name.

> [!NOTE]
> If anything goes wrong, you can run `docker logs <CONTAINER_NAME>` to see some helpful error messages. In case you run into some issues in this step, please make sure to [reset the configuration](#resetting-the-configuration) after fixing the error.

---

### 5. Stopping

To stop, use

```sh
docker compose stop
```

---

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

---

## Call Back

This initiative will help maintain an index of Wikibases. The goal of this index is to gather more quantitative data to learn more about how Wikibase is being used. It eventually also aims to be a central hub for data re-use and federation initiatives between Wikibases, where users can discover other Wikibases easily. 

You can join this initiative by setting `METADATA_CALLBACK=true` or disable the feature by setting `METADATA_CALLBACK=false` in your `.env` file. 

For more information, you can check out [this FAQ](./FAQs.md#what-are-the-future-plans-for-the-call-back-feature-and-what-information-does-it-collect).
