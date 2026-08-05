# Wikibase Suite (WBS) tools image

The Wikibase Suite (WBS) tools image provides the browser-based and command-line setup applications used to install WBS. The WBS installation scripts run this image with the WBS checkout mounted into the container so the tools can validate configuration and write the instance `.env` file.

The image definition and application source are maintained under [`development/images/wbs-tools`](https://github.com/wmde/wikibase-suite/tree/main/development/images/wbs-tools).

Most users do not need to run this image directly. Use the [WBS Installation Guide](../../install.md), which selects a compatible tools image and supplies the required mounts and environment variables.

## Releases

Official releases of this image are available on [Docker Hub as `wikibase/wbs-tools`](https://hub.docker.com/r/wikibase/wbs-tools).

See the [image changelog](https://github.com/wmde/wikibase-suite/blob/main/development/images/wbs-tools/CHANGELOG.md) for release notes. Documentation at previous releases is preserved in the repository under the corresponding [`wbs-tools@…` tag](https://github.com/wmde/wikibase-suite/tags).

This image uses the shared WBS image tag format. See [WBS Versions](https://github.com/wmde/wikibase-suite/blob/main/docs/versions.md).

WBS releases select a compatible tools major version. Minor and patch tools releases within that major version must remain compatible with the mounted WBS checkout and its host-side scripts.

## Authors & contact

This image is maintained by the Wikibase Suite Team at [Wikimedia Germany (WMDE)](https://wikimedia.de).

If you have questions or need help, use this [bug report form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start a conversation with the engineering team.
