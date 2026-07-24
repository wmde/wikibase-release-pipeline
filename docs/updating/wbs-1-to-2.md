# Upgrading from WBS 1 to 2

This upgrade follows the standard major-version procedure and preserves the existing installation and Docker volumes. It upgrades the Wikibase image from MediaWiki 1.39.8 to MediaWiki 1.41.2.

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. Read the [WBS and image release notes for WBS 2.0.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%402.0.0/CHANGES.md#wikibase-release-pipeline-200).

2. Read the [MediaWiki 1.41.2 UPGRADE file](https://github.com/wikimedia/mediawiki/blob/1.41.2/UPGRADE) and prepare any applicable customizations for MediaWiki 1.41.2.

   This upgrade requires no new `.env` values. Preserve `deploy/.env` unchanged.

3. If you modified tracked files such as `deploy/docker-compose.yml`, commit those changes before switching versions.

4. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). The backup procedure stops Wikibase Suite; continue directly with the migration.

## Migrate

1. Ensure Wikibase Suite services are stopped.

   ```sh
   cd /path/to/wikibase-release-pipeline/deploy
   docker compose down
   ```

2. From the repository root, fetch and check out WBS 2.0.0.

   ```sh
   cd ..
   git remote update
   git checkout deploy@2.0.0
   cd deploy
   ```

3. Reconcile any committed customizations with the files in the new release.

4. Pull the new images and start Wikibase Suite.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```
