---
sidebar_position: 1
slug: /
hide_title: true
sidebar_label: Introduction
---
## Wikibase Suite Deploy

Wikibase Suite (WBS) Deploy is a containerized, production-ready [Wikibase](https://wikiba.se) system that allows you to self-host a knowledge graph similar to [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). In addition to Wikibase on MediaWiki, WBS Deploy includes the Wikidata Query Service (WDQS), QuickStatements, Elasticsearch, and a Traefik reverse proxy with SSL termination and ACME support. The service orchestration is implemented using Docker Compose.

> 🔧 This document is for people wanting to self-host the full Wikibase Suite using Wikibase Suite Deploy. If you are looking for individual WBS images, head over to [hub.docker.com/u/wikibase](https://hub.docker.com/u/wikibase).

> 💡 This document presumes familiarity with basic Linux administration tasks and with Docker and Docker Compose.

### What's in the box?

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

