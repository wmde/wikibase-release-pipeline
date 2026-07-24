# Wikibase Suite

Wikibase Suite is a production-ready Wikibase software bundle that allows you to self-host a public knowledge graph similar to Wikidata. It includes MediaWiki, Wikibase, QuickStatements, Query Service, and an SSL certificate for your public instance.

**What's Included**

- Wikibase and MediaWiki for creating and managing structured linked data.
- Query Service and Query Service UI for SPARQL queries.
- Query Service Updater to keep query data in sync.
- QuickStatements for batch imports and edits.
- MariaDB, OpenSearch, Job Runner, and Traefik.

## Installing Wikibase Suite

For a new server, start with the [Wikibase Suite installation guide](./docs/installation.md).

## Updating Wikibase Suite

Use [Updating](./docs/updating.md) for minor updates, patch updates, and major version upgrades.

## Operating Wikibase Suite

Use these guides for help in maintaining, operating, and customizing an existing Wikibase Suite instance:

- [Advanced configuration](./docs/advanced-configuration.md)
- [Backup and restore](./docs/backup-and-restore.md)
- [Resetting](./docs/resetting.md)
- [Uninstalling](./docs/uninstalling.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Glossary](./docs/glossary.md)

## Community and Support

- [Wikibase website](https://wikiba.se/)
- [Wikibase Telegram community channel](https://t.me/+WBsf9-C9KPuMZCDT)
- [Wikibase Mastodon](https://wikis.world/@Wikibase)
- [Wikibase user group mailing list](https://lists.wikimedia.org/postorius/lists/wikibaseug.lists.wikimedia.org/?source=post_page)
- [Wikibase Suite Phabricator board](https://phabricator.wikimedia.org/project/board/5755/)
- [Wikibase Suite team email](mailto:wikibase-suite-support@wikimedia.de)

If something is not working as expected, start with [Troubleshooting](./docs/troubleshooting.md). If you have questions or need help, use this [bug report form](https://phabricator.wikimedia.org/maniphest/task/edit/form/129/) to start a conversation with the engineering team.

## Wikibase Suite images

Wikibase Suite uses a set of published container images which can also be used independently. See the [image documentation](./docs/images/README.md) for their configuration options and release notes.

## Development

Image sources and the build, integration-test, and release tooling are maintained in [`development/`](./development/README.md). Most Wikibase Suite users do not need these tools. They are available for contributors and advanced users who want to build customized images.
