# Wikibase Suite Search Image

[OpenSearch](https://opensearch.org/) is a search engine based on the Lucene library.

This image contains the OpenSearch server with the
[org.wikimedia.search/opensearch-extra](https://central.sonatype.com/artifact/org.wikimedia.search/opensearch-extra)
and
[org.wikimedia.search.highlighter/cirrus-highlighter-opensearch-plugin](https://central.sonatype.com/artifact/org.wikimedia.search.highlighter/cirrus-highlighter-opensearch-plugin)
plugins for [Wikibase](https://wikiba.se).

> 💡 This image is part of [Wikibase Suite (WBS)](https://github.com/wmde/wikibase-suite) which provides everything you need to run a Wikibase instance on your own server.

## Requirements

In order to run Wikibase search, you need:

- MediaWiki/Wikibase instance

### MediaWiki/Wikibase instance

We suggest using the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase) because this is the image we
run all our tests against. Follow the setup instructions over there to get it up and running.

Be sure to add the `ELASTICSEARCH_HOST` environment variable to your Wikibase container. This legacy variable name is retained so existing Wikibase configuration remains compatible.

## Example

For an integrated Docker Compose example showing how this image is used in the full Wikibase Suite configuration, see [wikibase-suite/docker-compose.yml](https://github.com/wmde/wikibase-suite/blob/main/docker-compose.yml).

## Releases

Official releases of this image can be found on [Docker Hub wikibase/opensearch](https://hub.docker.com/r/wikibase/opensearch).

## Versioning

This image uses the shared WBS image tag format. See [Wikibase Suite image versioning](../../docs/versioning.md).

In addition to the standard tags, this image also publishes a tag that includes the bundled OpenSearch version.

| Tag | Example | Description |
| --- | --- | --- |
| os*OPENSEARCH-VERSION* | os1.3.20 | Points to the latest image release containing that OpenSearch version. |

## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/opensearch/Dockerfile).

## Authors & contact

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not listed above or need help, use this [bug report
form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start
a conversation with the engineering team.
