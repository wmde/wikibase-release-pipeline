# Wikibase Suite tools image

The WBS tools image provides the browser-based and command-line setup applications used to install Wikibase Suite (WBS). The WBS installation scripts run this image with the WBS checkout mounted into the container so the tools can validate configuration and write the instance `.env` file.

Most users do not need to run this image directly. Use the [WBS installation guide](../../installation.md), which selects a compatible tools image and supplies the required mounts and environment variables.

## Releases

Official releases of this image are available on [Docker Hub as `wikibase/wbs-tools`](https://hub.docker.com/r/wikibase/wbs-tools).

See the [image changelog](https://github.com/wmde/wikibase-release-pipeline/blob/main/development/images/wbs-tools/CHANGELOG.md) for release notes. Documentation at previous releases is preserved in the repository under the corresponding [`wbs-tools@…` tag](https://github.com/wmde/wikibase-release-pipeline/tags).

## Versioning

This image uses the shared WBS image tag format. See [Versions](https://github.com/wmde/wikibase-release-pipeline/blob/main/docs/versions.md).

WBS releases select an exact tools image version. This prevents the tools runtime and the mounted WBS checkout from becoming incompatible.

## Source

The image definition and application source are maintained under [`development/images/wbs-tools`](https://github.com/wmde/wikibase-release-pipeline/tree/main/development/images/wbs-tools).

## Authors and contact

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions or need help, use this [bug report form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start a conversation with the engineering team.
