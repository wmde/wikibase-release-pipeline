# Updating Wikibase Suite (WBS)

WBS uses [semantic versioning](https://semver.org/spec/v2.0.0.html). WBS and each WBS image have individual version numbers.

WBS references the latest minor and patch releases of compatible WBS image major versions using Docker image major-version tags. For example, WBS 2.0.1 might reference `wikibase/wikibase:3`, a tag that points to the latest Wikibase 3.x.x image.

If you have not already, [log in to your server and change to your Wikibase Suite directory](./README.md#accessing-your-wikibase-suite-server).

For the tag formats used by WBS images, see [Wikibase Suite image versioning](../images/versioning.md).

## Minor and patch updates

Minor and patch updates may be announced for WBS itself or for an individual WBS image. A WBS release updates the product configuration and requires switching to its new git tag. An image release updates one of the bundled services and is installed by pulling the image through the compatible major-version tag already referenced by WBS.

### Update WBS

Switching to a WBS tag within the same major version will never trigger breaking changes. These updates are **always** considered safe. If you made no changes to `docker-compose.yml`, you may update simply by switching the git tag.

The commands below are for installations that have not changed `docker-compose.yml`. If you customized that file, commit your changes and reconcile them with the target release instead.

> [!NOTE]
> WBS 7 and earlier releases use `deploy@…` tags; WBS 8 and later releases use `wikibase-suite@…` tags.

Replace the example `wikibase-suite@8.0.1` tag below with the tag for the release you are updating to:

```sh
git remote update
git checkout wikibase-suite@8.0.1
docker compose pull
docker compose up -d
```

### Update WBS images

Because WBS references the latest minor and patch releases of compatible WBS images, non-breaking changes, including security updates, can be pulled at any time.

For a production instance, take a backup first if you need a rollback point. Then run:

```sh
docker compose down
docker compose pull
docker compose up -d
```

If you installed user-defined extensions in `config/extensions`, update those regularly too. See [User-defined extension docs](../../config/extensions/README.md) for more information.

### Automatically update WBS images

To always pull WBS image updates when starting the stack, run:

```sh
docker compose up -d --pull always
```

You can run this command manually or schedule it with a systemd timer, cron job, or similar. It updates only the WBS images referenced by the current `docker-compose.yml`; it does not update the WBS version tag, apply major upgrades, or update user-defined extensions.

## Major version upgrades

Unlike minor and patch updates, major version upgrades require additional steps. WBS supports upgrading only one major version at a time because MediaWiki and its extensions may require intermediate database and configuration changes. For example, upgrading from WBS 5 to WBS 8 requires following the 5-to-6, 6-to-7, and 7-to-8 guides.

### Upgrade guides

Each guide below provides detailed step-by-step instructions for upgrading from one major version to the next. Although the upgrades have similar steps, each release may have additional requirements, so use the guide for the specific upgrade you are performing.

- **[Upgrading from WBS 7 to 8](./migration-guides/wbs-7-to-8.md)**
- [Upgrading from WBS 6 to 7](./migration-guides/wbs-6-to-7.md)
- [Upgrading from WBS 5 to 6](./migration-guides/wbs-5-to-6.md)
- [Upgrading from WBS 4 to 5](./migration-guides/wbs-4-to-5.md)
- [Upgrading from WBS 3 to 4](./migration-guides/wbs-3-to-4.md)
- [Upgrading from WBS 2 to 3](./migration-guides/wbs-2-to-3.md)
- [Upgrading from WBS 1 to 2](./migration-guides/wbs-1-to-2.md)

*Note that downgrading WBS versions is not supported. For recovery options after an unsuccessful upgrade, see [Backup and restore](./backup-and-restore.md).*
