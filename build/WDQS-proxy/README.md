# WBS WDQS Proxy Image

Proxy to put in front of the WBS WDQS Image enforcing READONLY requests, query timeouts and limits access to blazegraph sparql endpoints.

In order to change how this image is configured just mount over the wdqs.template file.

## Requirements

In order to run WDQS Proxy, you need:

- at least 2 GB RAM to start WDQS
- MediaWiki/Wikibase instance
- WDQS as server
- WDQS as updater
- Configuration via environment variables

### MediaWiki/Wikibase instance

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase) because this is the image we
run all our tests against. Follow the setup instructions over there to get it up and running.

### WDQS as server

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wdqs).

### WDQS as updater

We suggest to use the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wdqs), the same as used for WDQS server. Checkout the documentation how to run it in updater mode.

## Environment variables

| Variable                 | Default     | Description                  |
| ------------------------ | ----------- | ---------------------------- |
| `PROXY_PASS_HOST`        | "wdqs:9999" | Where to forward requests to |
| `PROXY_MAX_QUERY_MILLIS` | 60000       | Timeout in milliseconds      |

### Filesystem layout

| File                              | Description                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `/etc/nginx/conf.d/wdqs.template` | Template for the nginx config (substituted to `/etc/nginx/conf.d/default.conf` at runtime)                |
| `/etc/nginx/conf.d/default.conf`  | nginx config. To override this you must also use a custom entrypoint to avoid the file being overwritten. |

## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/WDQS/Dockerfile).

## Authors & Contact

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not listed above or need help, use this [bug report
form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start
a conversation with the engineering team.
