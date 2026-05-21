# Wikibase Suite Elasticsearch Image

[Elasticsearch](https://en.wikipedia.org/wiki/Elasticsearch) is a search engine based on the Lucene library.

This image contains the Elasticsearch server with the
[org.wikimedia.search/extra](https://central.sonatype.com/artifact/org.wikimedia.search/extra)
and
[org.wikimedia.search.highlighter/experimental-highlighter-elasticsearch-plugin](https://central.sonatype.com/artifact/org.wikimedia.search.highlighter/experimental-highlighter-elasticsearch-plugin)
plugins for [Wikibase](https://wikiba.se).

> 💡 This image is part of [Wikibase Suite (WBS)](../../deploy/README.md) which provides everything you need to run a Wikibase instance on your own server.

## Requirements

In order to run Wikibase Elasticsearch, you need:

- MediaWiki/Wikibase instance

### MediaWiki/Wikibase instance

We suggest using the [WBS Wikibase Image](https://hub.docker.com/r/wikibase/wikibase) because this is the image we
run all our tests against. Follow the setup instructions over there to get it up and running.

Be sure to add the `ELASTICSEARCH_HOST` environment variable to your Wikibase container.

## Example

For an integrated Docker Compose example showing how this image is used in the full Wikibase Suite configuration, see [deploy/docker-compose.yml](../../deploy/docker-compose.yml).

## Releases

Official releases of this image can be found on [Docker Hub wikibase/elasticsearch](https://hub.docker.com/r/wikibase/elasticsearch).

## Versioning

This image uses the shared WBS image tag format. See [Wikibase Suite image versioning](../../docs/versioning.md).

In addition to the standard tags, this image also publishes a tag that includes the bundled Elasticsearch version.

| Tag | Example | Description |
| --- | --- | --- |
| _MAJOR_._MINOR_._PATCH_\_es*ES-VERSION* | 3.1.7_es7.20.2 | Same as the standard patch-version tag, but also mentions the bundled Elasticsearch version. |

## Source

This image is built from this [Dockerfile](https://github.com/wmde/wikibase-release-pipeline/blob/main/build/elasticsearch/Dockerfile).

## Authors & contact

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions not listed above or need help, use this [bug report
form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start
a conversation with the engineering team.
