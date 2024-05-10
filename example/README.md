# Example docker compose configuration

The example docker compose configuration consists of one file, `docker-compose.yml`, which contains the services:

- Wikibase
  MediaWiki packaged with the Wikibase extension and other commonly used extensions
- Job Runner
  The MediaWiki JobRunner service which uses the same Wikibase container as above.
- mysql
  Uses the MariaDB image. MariaDB is a MySQL clone. 
- elasticsearch
  The search service used by MediaWiki instead of the built-in search service. Optional, but highly recommended.
- wdqs
  WikiData Query Service (WDQS) backend service.
- wdqs-frontend
  WDQS Frontend service.
- wdqs-proxy
  A middle layer for WDQS which serves to filter requests and make the service more secure. 
- wdqs-updater
  Keeps the WDQS data up to date with Wikibase.
- quickstatements
  QuickStatements service.

**This configuration serves as an example of how the images could be used together and isn't production ready**

## Configure your installation

Copy `template.env` to `.env` and replace the passwords and secrets with your own.

## Running a Wikibase instance

To run a Wikibase instance on port 80 run the following command:

```
docker compose up --wait
```

This will start up the services defined in [docker-compose.yml](docker-compose.yml), listed above. Feel free to remove any unwanted or unneeded services from `docker-compose.yml`, but be advised this is the configuration we test.

## Job runner

The example `docker-compose.yml` sets up a dedicated job runner which restarts itself after every job, to ensure that changes to the configuration are picked up as quickly as possible.

If you run large batches of edits, this job runner may not be able to keep up with edits.

You can speed it up by increasing the `JOBRUNNER_MAX_JOBS` variable to run more jobs between restarts, if you’re okay with configuration changes not taking effect in the job runner immediately. Alternatively, you can run several job runners in parallel by using the `--scale` option.

```sh
docker compose up --scale wikibase-jobrunner=8
```


---

# Wikibase Suite

## WMDE Wikibase Docker images
  
Wikimedia Deutschland (WMDE) maintains a series of Docker images designed to ease the creation, maintenance, and extension of a self-hosted instance of Wikibase (i.e MediaWiki with the Wikibase extension installed). The images currently maintained for this purpose are as follows:
  
  - [wikibase](https://hub.docker.com/r/wikibase/wikibase)

    MediaWiki packaged with the Wikibase extension and other commonly used extensions

  - [wdqs](https://hub.docker.com/r/wikibase/wdqs), [wdqs-frontend](https://hub.docker.com/r/wikibase/wdqs-frontend), and [wdqs-proxy](https://hub.docker.com/r/wikibase/wdqs-proxy)
    
    WikiData Query Service (WDQS)...

  - [quickstatements](https://hub.docker.com/r/wikibase/quickstatements)
    
    QuickStatements service.

  - [elasticsearch](https://hub.docker.com/r/wikibase/elasticsearch)

    The search service used by MediaWiki instead of the built-in search service. Optional, but highly recommended.

WMDE also provides a reference Docker Compose configuration for running all of the services together which is actively maintained and tested, and is the recommended starting place for most use cases. This reference configuration is called "Wikibase Suite", or WBS for short.

The remainder of this document is focused on running and WBS.

## Running Wikibase Suite (WBS)

### A. Starting WBS for the first time

From a shell or terminal in the directory where this README file is found do the following:

1) Whether locally or on an Internet server, make sure the system meets following minium requirements for running WBS:

  - AMD64 architecture
  - 8 GB of RAM
  - 500 MB of free disk space
  - Docker 22.0, or greater
  - Docker Compose 2.10, or greater

1) Make a copy of the configuration template: `cp template.env .env`
2) Open the `.env` file in a text editor of your choice. Read the comments carefully, and then set your own values according to the instructions found there.
3) Start WBS: `docker compose up --wait`

Upon the initial successful boot of the `wikibase` service a `LocalSettings.php` file is created in the `wikibase-config` Docker volume. Changes to the `.env` will no longer reflect in the container as long as this file exists, but settings can be changed directly in the `LocalSettings.php`. 

### B. Resetting WBS configuration

In the case of initial setup values may get entered incorrectly. To reset back to the initial installation state based upon the contents of the `.env` directory:

1) Delete `LocalSettings.php` from the Docker volume `wikibase-config`, or simply delete the volume.
2) Restart WBS: `docker compose down && docker compose up --wait`

### C. Updating WBS with patch releases

According to the tags specified in the `*_IMAGE_URL` variables releases will be made automatically on re-creation of the Docker containers specified for each service in the Docker Compose file. For example if  `wikibase/wikibase:v2` is specified then your instance will automatically move up to the latest 2.x series release once the existing containers are removed and the services started again. To remove and re-create the containers do the following: 

`docker compose down && docker compose up --wait`

### D. Upgrading to new major releases of WBS

*Major releases, which generally will only happen in concert with a MediaWiki major release (e.g. from version 1.40 to 1.41, etc), may need a bit more care than a normal update. See the instructions in the (Migration Guide)[#migration-guide] below for any "from version, to version" specific upgrade notes.*

### E. Removing WBS completely

⚠️ Backup any configuration or data you wish to retain before running the below command:

`docker compose down --volumes`

## Migration Guide

- MediaWiki 1.39 > MediaWiki 1.40
  
  ...

- MediaWiki 1.40 > MediaWiki 1.41

  ...

## Troubleshooting and FAQ

**Can I migrate an existing MediaWiki installation to the WBS Docker images?**

Yes...

**Can I host WBS locally?**

Yes, for testing, however due to the OAuth requirements you cannot use QuickStatements without a publically accessible domain name.

**Do you have any recommended Internet host / VPS provider recommendations?**
  
Not at this time. The WBS team has tested this configuration on a variety of providers, and as long as the minium technical requirements were met it ran as expected.


---
---




The images WMDE currently releases for this purpose are as follows:

- Wikibase: [wikibase](https://hub.docker.com/r/wikibase/wikibase)

  MediaWiki packaged with the Wikibase extension and other commonly used extensions

- ElasticSearch: [elasticsearch](https://hub.docker.com/r/wikibase/elasticsearch)

  The search service used by MediaWiki instead of the built-in search service. Optional, but highly recommended. This custom ElasticSearch image includes needed ElasticSearch extensions.

- WikiData Query Service (WDQS): [wdqs](https://hub.docker.com/r/wikibase/wdqs), [wdqs-frontend](https://hub.docker.com/r/wikibase/wdqs-frontend), [wdqs-proxy](https://hub.docker.com/r/wikibase/wdqs-proxy)

  Is the Wikimedia implementation of SPARQL server, based on the [Blazegraph](https://wiki.blazegraph.com/wiki/index.php) engine, originally designed to service queries for Wikidata, but is a generalized tool for any Wikibase installation. Please see more detailed description in the [User Manual](https://www.mediawiki.org/wiki/Wikidata_query_service/User_Manual).
  
- QuickStatements: [quickstatements](https://hub.docker.com/r/wikibase/quickstatements)

  Is a tool, written by [Magnus Manske](https://www.wikidata.org/wiki/User:Magnus_Manske), that can edit Wikidata items, based on a simple set of text commands. The tool can add and remove statements, labels, descriptions and aliases; as well as add statements with optional qualifiers and sources. The command sequence can be typed in the import window or created in a spreadsheet or text editor and pasted in. It can also be created by external code like Lua, called from a template and passed as a URL. Data edited in [OpenRefine](https://www.wikidata.org/wiki/Special:MyLanguage/Wikidata:Tools/OpenRefine) can also be exported to the QuickStatements format.

More documentation on each of the images can be found on each of their respective Docker Hub home pages at the links above.
-----

  - wdqs-updater
  - Job Runner
    The MediaWiki JobRunner service which uses the same Wikibase container as above.
  - mysql
    Uses the MariaDB image. MariaDB is a MySQL clone. 
  - nginx-proxy
  - acme-companion





  The Docker image releases which the WBS team releases are as follows:

  - [wikibase](https://hub.docker.com/r/wikibase/wikibase)

    MediaWiki packaged with the Wikibase extension and other commonly used extensions

  - https://hub.docker.com/r/wikibase/elasticsearch

    The search service used by MediaWiki instead of the built-in search service. Optional, but highly recommended.

  - [wdqs](https://hub.docker.com/r/wikibase/wdqs), [wdqs-frontend](https://hub.docker.com/r/wikibase/wdqs-frontend), [wdqs-proxy](https://hub.docker.com/r/wikibase/wdqs-proxy)
    
    WikiData Query Service (WDQS)...

  - [quickstatements](https://hub.docker.com/r/wikibase/quickstatements)
    
    QuickStatements service.
