## Wikibase Suite Wikidata Query Service Frontend (wdqs-frontend) Image

Frontend for the [Wikidata Query Service (WDQS)](https://www.mediawiki.org/wiki/Wikidata_Query_Service).

To interact with the WDQS frontend, navigate to the URL corresponding to the port allocated for it. In the example below, the WDQS frontend is available at `http://localhost:8834`.

When writing queries using the frontend interface, click "Code" to view the corresponding URL.

For general instructions on using WDQS, building SPARQL queries, and additional resources, see:
- [Wikidata Query Service User Manual](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual)
- [What is SPARQL](https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service)

> 💡 This image is part of Wikibase Suite (WBS). [WBS Deploy](https://github.com/wmde/wikibase-release-pipeline/deploy/README.md) provides everything you need to self-host a Wikibase instance out of the box.

## Requirements

In order to run WDQS Frontend, you need:

- at least 2 GB RAM to start WDQS
- MediaWiki/Wikibase instance
- WDQS as server
- WDQS as updater
- Reverse proxy (if Wikibase and WDQS Frontend are running on the same host)
- Configuration via environment variables

### MediaWiki/Wikibase instance

We suggest using the [WBS Wikibase image](https://hub.docker.com/r/wikibase/wikibase) because this is the image we run all our tests against. Follow the setup instructions over there to get it up and running.

### WDQS as server

We suggest using the [WBS WDQS image](https://hub.docker.com/r/wikibase/wdqs).

### WDQS as updater

We suggest using the [WBS WDQS image](https://hub.docker.com/r/wikibase/wdqs), the same as used for WDQS server. Check out the [documentation](https://wikitech.wikimedia.org/wiki/Wikidata_Query_Service) to learn how to run it in updater mode.

### Reverse proxy

If QuickStatements and Wikibase are running on the same IP address, a reverse proxy is required to route HTTP requests to Wikibase or QuickStatements, depending on the URL used to access them. See the [example](#Example) below for a reverse proxy setup using [Traefik](https://doc.traefik.io/traefik/).

### Environment variables

Variables in **bold** are required.

| Variable                  | Default                      | Description                    |
| ------------------------- | ---------------------------- | -------------------------------|
| `LANGUAGE`                | "en"                         | Language to use in the UI      |
| **`WDQS_PUBLIC_URL`**     |                              | Hostname of the WDQS host      |
| **`WIKIBASE_PUBLIC_URL`** |                              | Hostname of the Wikibase host  |

## Example

For an integrated Docker Compose example showing how to run this image with the other published Wikibase Suite images, see the WBS Deploy configuration: [deploy/docker-compose.yml](https://github.com/wmde/wikibase-release-pipeline/blob/main/deploy/docker-compose.yml).

## Releases

Official releases of this image can be found on [Docker Hub wikibase/wdqs-frontend](https://hub.docker.com/r/wikibase/wdqs-frontend).

## Tags and versioning

This WDQS Frontend image is using [semantic versioning](https://semver.org/spec/v2.0.0.html).

We provide several tags that relate to the versioning semantics.

| Tag                                             | Example                   | Description                                                                                                                                                                                                                                |
| ----------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| _MAJOR_                                         | 3                         | Tags the latest image with this major version. Gets overwritten whenever a new version is released with this major version. This will include new builds triggered by base image changes, patch version updates and minor version updates. |
| _MAJOR_._MINOR_                                 | 3.1                       | Tags the latest image with this major and minor version. Gets overwritten whenever a new version is released with this major and minor version. This will include new builds triggered by base image changes and patch version updates.    |
| _MAJOR_._MINOR_._PATCH_                         | 3.1.7                     | Tags the latest image with this major, minor and patch version. Gets overwritten whenever a new version is released with this major, minor and patch version. This only happens for new builds triggered by base image changes.            |
| _MAJOR_._MINOR_._PATCH_\_build*BUILD-TIMESTAMP* | 3.1.7_build20240530103941 | Tag that never gets overwritten. Every image will have this tag with a unique build timestamp. Can be used to reference images explicitly for reproducibility.                                                                             |

## Internal filesystem layout

Hooking into the internal filesystem can extend the functionality of this image.

| File                                         | Description                                |
| -------------------------------------------- | ------------------------------------------ |
| `/config/wdqs-frontend-config.json`          | Configuration file for the WDQS frontend.  |
| `/templates/nginx-default.conf.template`     | Nginx config template.                     |


## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/wdqs-frontend/Dockerfile).

## Authors

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not covered above or need further help, use this [bug report form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start a conversation with the engineering team.
