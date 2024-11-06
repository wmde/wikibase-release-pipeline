---
sidebar_position: 2
slug: /landing/deploy
---

# Getting Started

The easiest way to get started with Wikibase Suite is **Wikibase Suite Deploy**, a containerized, production-ready [Wikibase](https://wikiba.se) system that allows you to self-host a knowledge graph similar to [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). 

Deploy combines and configures all the components required to run a fully featured Wikibase instance on the public internet. It includes:

- Wikibase on MediaWiki
- Query Service (WDQS) with a web frontend to run SPARQL queries
- QuickStatements for data import
- Elasticsearch backend for full text search
- Traefik reverse proxy for SSL/HTTPS via ACME

The service orchestration is implemented using Docker Compose.

## Setup a Deploy instance
In order so setup your Wikibase Suite Deploy instance, check out the [Deploy documentation](../deploy).

<!-- ## Releases -->
<!-- Where to find Deploy releases? -->
