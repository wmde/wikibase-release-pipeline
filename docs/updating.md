# Updating Wikibase Suite

Wikibase Suite (WBS) uses [semantic versioning](https://semver.org/spec/v2.0.0.html). WBS and each WBS image have individual version numbers.

WBS references the latest minor and patch releases of compatible WBS image major versions using Docker image major-version tags. For example, WBS 2.0.1 might reference `wikibase/wikibase:3`, a tag that points to the latest Wikibase 3.x.x image.

For the tag formats used by WBS images, see [Wikibase Suite image versioning](https://github.com/wmde/wikibase-release-pipeline/blob/main/docs/images/versioning.md).

## Minor and patch updates

Minor and patch updates may be announced for WBS itself or for an individual WBS image. A WBS release updates the product configuration and requires switching to its new git tag. An image release updates one of the bundled services and is installed by pulling the image through the compatible major-version tag already referenced by WBS.

### Update WBS

WBS versions are tagged in git with tags such as `wikibase-suite@8.0.1`. Switching to a tag with the same major version will never trigger breaking changes. These updates are **always** considered safe. If you made no changes to `docker-compose.yml`, you may update simply by switching the git tag.

```sh
git remote update
git checkout wikibase-suite@8.0.1
docker compose pull
docker compose up -d
```

> 💡 If you made any changes to `docker-compose.yml`, commit them. Merge with upstream changes as you see fit.

### Update WBS images

Because WBS references the latest minor and patch releases of compatible WBS images, non-breaking changes, including security updates, can be pulled at any time.

For a production instance, take a backup first if you need a rollback point. Then run:

```sh
docker compose down
docker compose pull
docker compose up -d
```

If you installed user-defined extensions in `config/extensions`, update those regularly too. See [User-defined extension docs](../config/extensions/README.md) for more information.

### Automatically update WBS images

To always pull WBS image updates when starting the stack, run:

```sh
docker compose up -d --pull always
```

You can run this command manually or schedule it with a systemd timer, cron job, or similar. It updates only the WBS images referenced by the current `docker-compose.yml`; it does not update the WBS version tag, apply major upgrades, or update user-defined extensions.

## Major version upgrades

Unlike minor and patch updates, major version upgrades require additional steps. WBS supports upgrading only one major version at a time because MediaWiki and its extensions may require intermediate database and configuration changes. For example, upgrading from WBS 5 to WBS 8 requires following the 5-to-6, 6-to-7, and 7-to-8 guides.

Each guide below provides the step-by-step procedure for upgrading from each version to the next.

*Note that downgrading WBS versions is not supported. For recovery options after an unsuccessful upgrade, see [Backup and restore](./backup-and-restore.md).*

### Upgrade guides

Follow the guide for each major-version transition:

- [WBS 7.x.x to 8.x.x](./updating/wbs-7-to-8.md) — follows the standard upgrade procedure with extra steps to migrate to the new repository name and the collapse of `deploy/` directory into the repository root.
- [WBS 6.x.x to 7.x.x](./updating/wbs-6-to-7.md) — follows the standard upgrade procedure with release-specific configuration and search-index considerations.
- [WBS 5.x.x to 6.x.x](./updating/wbs-5-to-6.md) — follows the standard upgrade procedure.
- [WBS 4.x.x to 5.x.x](./updating/wbs-4-to-5.md) — follows the standard upgrade procedure and adds a required environment setting.
- [WBS 3.x.x to 4.x.x](./updating/wbs-3-to-4.md) — follows the standard upgrade procedure with routing and service changes.
- [WBS 2.x.x to 3.x.x](./updating/wbs-2-to-3.md) — follows the standard upgrade procedure with query-service and routing changes.
- [WBS 1.x.x to 2.x.x](./updating/wbs-1-to-2.md) — follows the standard upgrade procedure.
