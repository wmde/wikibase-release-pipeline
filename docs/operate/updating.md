# Updating and Upgrading

Wikibase Suite (WBS) and its images are updated separately. Before continuing, see [Wikibase Suite (WBS) Versions](../versions.md) to identify whether an available update is a patch, minor, or major update and whether it applies to WBS or to an individual image.

## Minor and patch updates

Minor and patch updates may be announced for WBS itself or for an individual WBS Docker Image. A WBS release updates the product configuration and requires switching to its new git tag. An image release updates one of the bundled services and is installed by pulling the image through the compatible major-version tag already referenced by WBS.

### Update WBS

Switching to a WBS tag within the same major version will never trigger breaking changes. These updates are **always** considered safe. If you made no changes to `docker-compose.yml`, you may update simply by switching the git tag.

1. If you have not already, [log in to your server and change to your WBS directory](./README.md#accessing-your-wbs-server).

2. If you customized `docker-compose.yml`, commit your changes and reconcile them with the target release. Otherwise, continue to the next step.

3. Replace the example `wbs@8.0.1` tag below with the tag for the release you are updating to, then fetch the tag, check it out, pull the images, and start the services.

   > [!NOTE]
   > WBS 7 and earlier releases use `deploy@…` tags; WBS 8 and later releases use `wbs@…` tags.

   ```sh
   git remote update
   git checkout wbs@8.0.1
   docker compose pull
   docker compose up -d
   ```

### Update WBS Docker Images

Because WBS references the latest minor and patch releases of compatible WBS Docker Images, non-breaking changes, including security updates, can be pulled at any time.

1. If you have not already, [log in to your server and change to your WBS directory](./README.md#accessing-your-wbs-server).

2. For a production instance, [back up your data](./backup-and-restore.md#back-up-your-data) if you need a rollback point. The backup procedure stops WBS; continue directly with the next step.

3. Pull the images and apply the updates. Running services remain available while the images download; Compose then recreates only the services whose images changed.

   ```sh
   docker compose pull
   docker compose up -d
   ```

4. If you installed extensions in `config/extensions`, keep them up to date independently. See [Updating Extensions](./update-extensions.md) for the update procedure.

### Automatically update WBS Docker Images

1. If you have not already, [log in to your server and change to your WBS directory](./README.md#accessing-your-wbs-server).

2. To pull updates to the WBS Docker Images whenever you start the stack, run:

   ```sh
   docker compose up -d --pull always
   ```

   You can run this command manually or schedule it with a systemd timer, cron job, or similar. It updates only the WBS Docker Images referenced by the current `docker-compose.yml`; it does not update the WBS version tag, apply major upgrades, or update extensions in `config/extensions`.

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

*Note that downgrading WBS versions is not supported. For recovery options after an unsuccessful upgrade, see [Backing Up and Restoring](./backup-and-restore.md).*
