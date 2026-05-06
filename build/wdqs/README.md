# Wikibase Suite Wikidata Query Service (wdqs) image

The [Wikidata Query Service (WDQS)](https://www.mediawiki.org/wiki/Wikidata_Query_Service) provides a way for tools to access Wikibase data, via a SPARQL API. It is based on [Blazegraph](https://github.com/blazegraph/database/wiki/Main_Page).

> 💡 This image is part of Wikibase Suite (WBS). [WBS Deploy](https://github.com/wmde/wikibase-release-pipeline/deploy/README.md) provides everything you need to self-host a Wikibase instance out of the box.

## Requirements

In order to run WDQS, you need:

- at least 2 GB RAM to start WDQS
- MediaWiki/Wikibase instance
- WDQS as server
- WDQS as updater
- WDQS Proxy for public facing setups
- Configuration via environment variables

### MediaWiki/Wikibase instance

We suggest using the [WBS Wikibase image](https://hub.docker.com/r/wikibase/wikibase) because this is the image we run all our tests against. Follow the setup instructions over there to get it up and running.

### WDQS as server

You'll need one instance of the image to execute the actual WDQS daemon started using `/runBlazegraph.sh`.

You can send `GET` requests with your SPARQL query to the WDQS endpoint (following the example below):
`http://wdqs:9999/bigdata/namespace/wdq/sparql?query={SPARQL}`

### WDQS as updater

You'll need one instance of the image to execute the updater started using `/runUpdate.sh`. This polls changes from Wikibase.

### Proxy for public facing setups

By default, WDQS exposes some endpoints and methods that reveal internal details or functionality that might not be intended in every setup, especially when running as a public service. The example below includes a traefik proxy configuration limiting the functionality WDQS exposes.

### Environment variables

Variables in **bold** are required.

| Variable                   | Default    | Description                                                                                                                                                                                                                                                               |
| -------------------------  | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`WIKIBASE_HOST`**        | "wikibase" | Hostname to reach the Wikibase service, e.g. the docker network internal hostname                                                                                                                                                                                         |
| **`WIKIBASE_CONCEPT_URI`** | ""         | Concept URI, required for `/runUpdate.sh` only, the identifying prefix to entities in this knowledge graph, e.g. the public URL of the Wikibase host.                                                                                                                     |
| **`WDQS_HOST`**            | "wdqs"     | WDQS hostname (this service)                                                                                                                                                                                                                                              |
| **`WDQS_PORT`**            | "9999"     | WDQS port (this service)                                                                                                                                                                                                                                                  |
| `WIKIBASE_SCHEME`          | "http"     | URL scheme used to reach the Wikibase service, e.g. http to reach a local wikibase on the same docker network                                                                                                                                                             |
| `WDQS_ENTITY_NAMESPACES`   | "120,122"  | Wikibase namespaces to load data from                                                                                                                                                                                                                                     |
| `WIKIBASE_MAX_DAYS_BACK`   | "90"       | Maximum number of days updater can reach back in time from now                                                                                                                                                                                                            |
| `MEMORY`                   | ""         | Memory limit for Blazegraph                                                                                                                                                                                                                                               |
| `HEAP_SIZE`                | "1g"       | Heap size for Blazegraph                                                                                                                                                                                                                                                  |
| `BLAZEGRAPH_EXTRA_OPTS`    | ""         | Extra options to be passed to Blazegraph,they must be prefixed with `-D`. Example: `-Dhttps.proxyHost=http://my.proxy.com -Dhttps.proxyPort=3128`. See [the WDQS User Manual](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual#Configurable_properties). |

## Example

For an integrated Docker Compose example showing how to run this image with the other published Wikibase Suite images, see the WBS Deploy configuration: [deploy/docker-compose.yml](https://github.com/wmde/wikibase-release-pipeline/blob/main/deploy/docker-compose.yml).

## Releases

Official releases of this image can be found on [Docker Hub wikibase/wdqs](https://hub.docker.com/r/wikibase/wdqs).

## Tags and Versioning

This image uses [semantic versioning](https://semver.org/spec/v2.0.0.html).

We provide several tags that relate to the versioning semantics.

| Tag                                             | Example                   | Description                                                                                                                                                                                                                                |
| ----------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| _MAJOR_                                         | 3                         | Tags the latest image with this major version. Gets overwritten whenever a new version is released with this major version. This will include new builds triggered by base image changes, patch version updates and minor version updates. |
| _MAJOR_._MINOR_                                 | 3.1                       | Tags the latest image with this major and minor version. Gets overwritten whenever a new version is released with this major and minor version. This will include new builds triggered by base image changes and patch version updates.    |
| _MAJOR_._MINOR_._PATCH_                         | 3.1.7                     | Tags the latest image with this major, minor and patch version. Gets overwritten whenever a new version is released with this major, minor and patch version. This only happens for new builds triggered by base image changes.            |
| _MAJOR_._MINOR_._PATCH_\_wdqs*WDQS-VERSION*     | 3.1.7_wdqs0.1.317         | Same as above, but also mentioning the current WDQS version.                                                                                                                                                                               |
| _MAJOR_._MINOR_._PATCH_\_build*BUILD-TIMESTAMP* | 3.1.7_build20240530103941 | Tag that never gets overwritten. Every image will have this tag with a unique build timestamp. Can be used to reference images explicitly for reproducibility.                                                                             |

## Upgrading

When upgrading between WDQS versions, the data stored in `/wdqs/data` may not be compatible with the newer version. When testing the new image, if no data appears to have been loaded into the Query Service, you'll need to reload the data.

If all changes still appear in [RecentChanges], removing `/wdqs/data` and restarting the service should reload all data.

However, [RecentChanges] are periodically purged of older entries, as determined by the MediaWiki configuration [\$wgRCMaxAge](https://www.mediawiki.org/wiki/Manual:$wgRCMaxAge).

If you can't use [RecentChanges], you'll need to reload from an RDF dump:

- [Make an RDF dump from your Wikibase repository using the dumpRdf.php maintenance script.](https://doc.wikimedia.org/Wikibase/master/php/docs_topics_rdf-binding.html)
- [Load the RDF dump into the query service](https://github.com/wikimedia/wikidata-query-rdf/blob/master/docs/getting-started.md#load-the-dump)

## Internal filesystem layout

Hooking into the internal filesystem can extend the functionality of this image.

| File                         | Description                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `/wdqs/allowlist.txt`        | SPARQL endpoints allowed for federation                                                        |
| `/wdqs/RWStore.properties`   | Properties for the service                                                                     |
| `/templates/mwservices.json` | Template for MediaWiki services (populated and placed into `/wdqs/mwservices.json` at runtime) |

## Known issues

### Updater keeps restarting

In some situations the WDQS Updater enters a restart loop, e.g., when restarted without containing any entities. When you restart a freshly installed instance, you will encounter this issue.

A workaround is to start the updater once with manual `--init` `--start` parameters. This forces it to sync data from MediaWiki for the current day.

In a Wikibase Suite Deploy instance, or another Docker Compose setup with a `wdqs-updater` service, use the commands below.

```sh
# Stop the stock updater
docker compose stop wdqs-updater

# Start an updater with force sync settings
docker compose run --rm wdqs-updater /wdqs/runUpdate.sh -h http://\$WDQS_HOST:\$WDQS_PORT -- --wikibaseUrl \$WIKIBASE_SCHEME://\$WIKIBASE_HOST --conceptUri \$WIKIBASE_CONCEPT_URI --entityNamespaces \$WDQS_ENTITY_NAMESPACES --init --start $(date +%Y%m%d000000)

# As soon as you see "Sleeping for 10 secs" in the logs, press CTRL-C to stop it again

# Start the stock updater again
docker compose start wdqs-updater
```

As soon as the updater has synced the first entity from MediaWiki, the issue should disappear.

## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/wdqs/Dockerfile).

## Authors & Contact

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not listed above or need help, use this [bug report form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start a conversation with the engineering team.
