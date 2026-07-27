# Upgrading from WBS 2 to 3

This upgrade follows the standard major-version procedure and preserves the existing installation and Docker volumes. It upgrades the Wikibase image from MediaWiki 1.41.2 to MediaWiki 1.42.5 and updates the Query Service and routing configuration.

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. If you have not already, [log in to your server and change to your Wikibase Suite directory](../README.md#accessing-your-wikibase-suite-server).

2. Read the changelog entries for the target WBS release and images changed by this upgrade:

   - [WBS 3.0.4](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%403.0.4/deploy/CHANGELOG.md#304-2025-02-24)
   - [Wikibase image 3.0.3](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%403.0.4/build/wikibase/CHANGELOG.md#303-2025-02-24)
   - [Query Service image 2.0.1](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%403.0.4/build/wdqs/CHANGELOG.md#201-2025-01-22)

3. Prepare the configuration for MediaWiki 1.42.5.

   Read the [MediaWiki 1.42.5 UPGRADE file](https://github.com/wikimedia/mediawiki/blob/1.42.5/UPGRADE) and prepare any applicable customizations for MediaWiki 1.42.5.

4. Review the Query Service and routing changes.

   The Query Service image moves from version 1 to version 2 and requires the Wikibase concept URI. The WBS 3 Compose file supplies it from the existing `WIKIBASE_PUBLIC_HOST` value.

   WBS 3 removes the direct host ports previously published for Wikibase, the Query Service frontend, and QuickStatements. Traefik handles all external HTTP and HTTPS traffic. Reconcile any custom integration or firewall rules that use ports `8880`, `8834`, or `8840`.

   This upgrade requires no new `.env` values. Preserve the real hostnames and all other values in the existing `deploy/.env`. Do not replace them with the `.example` values from `template.env`, which replace the previous `.example.com` examples.

5. If you modified tracked files such as `deploy/docker-compose.yml`, commit those changes before switching versions.

6. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). The backup procedure stops WBS; continue directly with the migration.

## Migrate

1. While still in your Wikibase Suite directory, ensure the services are stopped by running.

   ```sh
   docker compose down
   ```

2. From the repository root, fetch and check out WBS 3.0.4 so the installation includes all WBS 3 minor and patch updates.

   ```sh
   cd ..
   git remote update
   git checkout deploy@3.0.4
   cd deploy
   ```

3. Reconcile any committed customizations with the files in the new release.

4. Pull the new images and start Wikibase Suite.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```
