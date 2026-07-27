# Upgrading from WBS 7 to 8

As of Wikibase Suite 8, the source repository has moved from `wikibase-release-pipeline` to `wikibase-suite`, and the contents of the `deploy/` directory—from which Wikibase Suite was previously operated—have moved to the project root. These instructions create a new WBS 8 checkout beside the existing WBS 7 checkout, then copy the local configuration into it. The existing checkout remains available until the upgrade succeeds.

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. If you have not already, [log in to your server and change to your Wikibase Suite directory](../README.md#accessing-your-wikibase-suite-server).

2. Read the changelog entries for the target WBS release and images changed by this upgrade:

   - [WBS 8.0.0](../../../CHANGELOG.md#800-2026-07-20)
   - [Wikibase image 8.0.0](../../../development/images/wikibase/CHANGELOG.md#800-2026-07-20)
   - [OpenSearch image 1.0.0](../../../development/images/opensearch/CHANGELOG.md#100-2026-07-20)
   - [QuickStatements image 1.2.0](../../../development/images/quickstatements/CHANGELOG.md#120-2026-07-20)

3. Back up your data. See [Back up your data](../backup-and-restore.md#back-up-your-data). The backup procedure stops WBS; continue directly with the migration. The existing WBS 7 checkout preserves your old configuration during the migration.

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

3. Copy the environment file and `LocalSettings.php` into the new checkout. These are the only files most installations need to migrate.

   ```sh
   cp -a ../wikibase-release-pipeline/deploy/.env .env
   cp -a ../wikibase-release-pipeline/deploy/config/LocalSettings.php config/
   ```

   WBS 8 will use the existing `LocalSettings.php`, including any changes you added to it, and apply the required database updates when it starts.

4. **Only if you installed custom extensions:** Copy the extension configuration and your custom extensions into the new checkout:

   ```sh
   cp -a ../wikibase-release-pipeline/deploy/config/Extensions.php config/Extensions.php
   cp -a ../wikibase-release-pipeline/deploy/config/extensions/. config/extensions/
   git restore config/extensions/README.md
   ```

   Make sure the copied extensions are updated to versions compatible with MediaWiki 1.46 before continuing.

5. **Only if you customized the WBS 7 `deploy/docker-compose.yml` file:** Manually reapply those customizations to the WBS 8 `docker-compose.yml` file.

6. Pull the latest WBS 8 images and start Wikibase Suite from the new repository root.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```

   WBS 8 automatically uses the existing database, media, Query Service, QuickStatements, and certificate data.

7. Once the services show `healthy` and you have confirmed that Wikibase Suite—including any customizations or installed extensions—works as expected, you can safely delete the old `wikibase-release-pipeline` directory to avoid future confusion:

   ```sh
   cd ..
   rm -r wikibase-release-pipeline
   cd wikibase-suite
   ```

> [!NOTE]
> Update any custom scripts, scheduled jobs, or service definitions that previously ran Docker Compose from `wikibase-release-pipeline/deploy` to use `wikibase-suite/`.
