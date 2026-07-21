# Wikibase Suite release pipeline

This repository contains the tools used to update, build, test, publish, and release Wikibase Suite Docker images.

## Install Wikibase Suite

Wikibase Suite is a supported configuration for running your own [Wikibase](https://wikiba.se) on your own server and maintaining a knowledge graph similar to [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page) as part of the Linked Open Data initiative.

To install or maintain Wikibase Suite on your own server, start here: [Wikibase Suite](https://github.com/wmde/wikibase-suite).

## Community and support

- [Wikibase Suite](https://github.com/wmde/wikibase-suite)
- [Wikibase website](https://wikiba.se/)
- [Wikibase Telegram community channel](https://t.me/+WBsf9-C9KPuMZCDT)
- [Wikibase Mastodon](https://wikis.world/@Wikibase)
- [Wikibase user group mailing list](https://lists.wikimedia.org/postorius/lists/wikibaseug.lists.wikimedia.org/?source=post_page)
- [Wikibase Suite Phabricator board](https://phabricator.wikimedia.org/project/board/5755/)
- [Wikibase Suite team email](mailto:wikibase-suite-support@wikimedia.de)

## Advanced: Docker images

Each individual service packaged by Wikibase Suite is published as a Docker image on Docker Hub. For custom setups outside Wikibase Suite, you can run these images independently or combine them in your own orchestration layer, such as Kubernetes. See the documentation for each Docker image for setup requirements and configuration options:

- [Wikibase](./build/wikibase/README.md)
- [OpenSearch](./build/opensearch/README.md)
- [Query service](./build/wdqs/README.md)
- [Query service frontend](./build/wdqs-frontend/README.md)
- [QuickStatements](./build/quickstatements/README.md)

## Repository development

This repository contains the Wikibase Suite toolset used for [building](./build), [testing](./test), and [publishing](.github/workflows) Wikibase Suite images. The deployable Wikibase Suite product, installer, and user documentation live in [wmde/wikibase-suite](https://github.com/wmde/wikibase-suite).

For development setup, build and test commands, and release process notes, see [DEVELOPMENT.md](./DEVELOPMENT.md).
