# Upgrading from WBS 7 to 8

As of Wikibase Suite 8, the source repository has moved from `wikibase-release-pipeline` to `wikibase-suite`, and the contents of the `deploy/` directory—from which Wikibase Suite was previously operated—have moved to the project root. These instructions create a new WBS 8 checkout beside the existing WBS 7 checkout, then copy the local configuration into it. The existing checkout remains available until the upgrade succeeds.

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. If you have not already, [log in to your server and change to your Wikibase Suite directory](../README.md#accessing-your-wikibase-suite-server).

2. Read the `CHANGELOG` entries for the target WBS release and images changed by this upgrade:

   - [WBS 8.0.0](../../../CHANGELOG.md#800-2026-07-20)
   - [Wikibase image changelog](https://github.com/wmde/wikibase-release-pipeline/blob/main/development/images/wikibase/CHANGELOG.md)
   - [OpenSearch image changelog](https://github.com/wmde/wikibase-release-pipeline/blob/main/development/images/opensearch/CHANGELOG.md)
   - [QuickStatements image changelog](https://github.com/wmde/wikibase-release-pipeline/blob/main/development/images/quickstatements/CHANGELOG.md)

3. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). The backup procedure stops WBS; continue directly with the migration. Keep the existing WBS 7 checkout and configuration backup until the migration has succeeded and the new instance has been verified.

## Migrate

1. While still in your Wikibase Suite directory, ensure the services are stopped by running.

   ```sh
   docker compose down
   ```

2. From the directory above `wikibase-release-pipeline`, clone the Wikibase Suite 8 release, which will create a new `wikibase-suite` directory.

   ```sh
   cd ../..
   git clone --branch wbs@8.0.0 --single-branch https://github.com/wmde/wikibase-suite.git
   cd wikibase-suite
   ```

3. Copy `.env` and `LocalSettings.php` into the new checkout.

   ```sh
   cp -a ../wikibase-release-pipeline/deploy/.env .env
   cp -a ../wikibase-release-pipeline/deploy/config/LocalSettings.php config/
   ```

   WBS 8 will use the existing `LocalSettings.php`, including any changes you added to it, and apply the required database updates when it starts.

4. If you customized the WBS 7 installation, reconcile those changes with the WBS 8 files. This includes custom extensions, `Extensions.php`, other files under `config`, and `docker-compose.yml`. Keep the WBS 8 files as the base, and update any custom extensions to versions compatible with MediaWiki 1.46.

5. Pull the latest WBS 8 images and start Wikibase Suite from the new repository root.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```

   WBS 8 automatically uses the existing database, media, Query Service, QuickStatements, and certificate data.

6. Once the services show `healthy` and you have confirmed that Wikibase Suite—including any customizations or installed extensions—works as expected, you can safely delete the old `wikibase-release-pipeline` directory to avoid future confusion:

   ```sh
   cd ..
   rm -r wikibase-release-pipeline
   cd wikibase-suite
   ```

> [!NOTE]
> Update any custom scripts, scheduled jobs, or service definitions that previously ran Docker Compose from `wikibase-release-pipeline/deploy` to use `wikibase-suite/`.
