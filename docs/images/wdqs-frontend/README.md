# Wikibase Suite (WBS) Query Service frontend image

Frontend for the [Wikidata Query Service (WDQS)](https://www.mediawiki.org/wiki/Wikidata_Query_Service).

To interact with the WDQS frontend, navigate to the URL corresponding to the port allocated for it. In the example below, the WDQS frontend is available at `http://localhost:8834`.

When writing queries using the frontend interface, click "Code" to view the corresponding URL.

For general instructions on using WDQS, building SPARQL queries, and additional resources, see:
- [Wikidata Query Service User Manual](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual)
- [What is SPARQL](https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service)

> 💡 This image is part of [Wikibase Suite (WBS)](https://github.com/wmde/wikibase-release-pipeline/blob/main/README.md) which provides everything you need to run a Wikibase instance on your own server.

## Requirements

In order to run WDQS Frontend, you need:

- at least 2 GB RAM to start WDQS
- MediaWiki/Wikibase instance
- WDQS as server
- WDQS as updater
- Reverse proxy (if Wikibase and WDQS Frontend are running on the same host)
- Configuration via environment variables

### MediaWiki/Wikibase instance

We suggest using the [Wikibase image](https://hub.docker.com/r/wikibase/wikibase) because this is the image we run all our tests against. Follow the setup instructions there to get it running.

### WDQS as server

We suggest using the [Query Service image](https://hub.docker.com/r/wikibase/wdqs).

### WDQS as updater

We suggest using the [Query Service image](https://hub.docker.com/r/wikibase/wdqs), the same image used for the Query Service server. See the [Query Service documentation](https://wikitech.wikimedia.org/wiki/Wikidata_Query_Service) to learn how to run it in updater mode.

### Reverse proxy

If QuickStatements and Wikibase are running on the same IP address, a reverse proxy is required to route HTTP requests to Wikibase or QuickStatements, depending on the URL used to access them. See the [example](#Example) below for a reverse proxy setup using [Traefik](https://doc.traefik.io/traefik/).

### Environment variables

Variables in **bold** are required.

| Variable                  | Default                      | Description                    |
| ------------------------- | ---------------------------- | -------------------------------|
| `LANGUAGE`                | "en"                         | Language to use in the UI      |
| **`WDQS_PUBLIC_URL`**     |                              | Hostname of the WDQS host      |
| **`WIKIBASE_PUBLIC_URL`** |                              | Public URL of the Wikibase API, for example `https://wikibase.example/w/api.php` |

## Local query examples

By default, the frontend loads query examples from the local Wikibase page `Project:SPARQL/examples`. Create that page on the Wikibase side and add examples with `<sparql>` blocks. On startup, an existing configuration that still points at Wikidata is migrated by removing that legacy setting; a deliberately configured non-Wikidata examples source is preserved.

## Example

For an integrated Docker Compose example showing how this image is used in the full WBS configuration, see the root [docker-compose.yml](https://github.com/wmde/wikibase-release-pipeline/blob/main/docker-compose.yml).

## Releases

Official releases of this image can be found on [Docker Hub wikibase/wdqs-frontend](https://hub.docker.com/r/wikibase/wdqs-frontend).

See the [image changelog](https://github.com/wmde/wikibase-release-pipeline/blob/main/development/images/wdqs-frontend/CHANGELOG.md) for release notes. Documentation at previous releases is preserved in the repository under the corresponding [`wdqs-frontend@…` tag](https://github.com/wmde/wikibase-release-pipeline/tags).

## Versioning

This image uses the shared WBS image tag format. See [WBS Versions](https://github.com/wmde/wikibase-release-pipeline/blob/main/docs/versions.md).

## Internal filesystem layout

Hooking into the internal filesystem can extend the functionality of this image.

| File                                         | Description                                |
| -------------------------------------------- | ------------------------------------------ |
| `/config/wdqs-frontend-config.json`          | Configuration file for the WDQS frontend.  |
| `/healthcheck.sh`                            | Verifies that the frontend is serving requests. |
| `/templates/nginx-default.conf.template`     | Nginx config template.                     |


## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/development/images/wdqs-frontend/Dockerfile).

## Authors & contact

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not covered above or need further help, use this [bug report form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start a conversation with the engineering team.
