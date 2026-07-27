# Upgrading Wikibase Suite (WBS) from 5 to 6

This guide explains how to upgrade Wikibase Suite (WBS) from version 5 to 6 while preserving the existing installation and Docker volumes. It upgrades the Wikibase image from MediaWiki 1.44 to MediaWiki 1.45.

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. If you have not already, [log in to your server and change to your WBS directory](../README.md#accessing-your-wbs-server).

2. Read the `CHANGELOG` entries for the target WBS release and images changed by this upgrade:

   - [WBS 6.0.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%406.0.0/deploy/CHANGELOG.md#600-2026-02-16)
   - [Wikibase image changelog](https://github.com/wmde/wikibase-release-pipeline/blob/main/development/images/wikibase/CHANGELOG.md)
   - [Query Service image changelog](https://github.com/wmde/wikibase-release-pipeline/blob/main/development/images/wdqs/CHANGELOG.md)
   - [Query Service frontend image changelog](https://github.com/wmde/wikibase-release-pipeline/blob/main/development/images/wdqs-frontend/CHANGELOG.md)
   - [QuickStatements image changelog](https://github.com/wmde/wikibase-release-pipeline/blob/main/development/images/quickstatements/CHANGELOG.md)

3. Read the [MediaWiki 1.45 UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_45/UPGRADE) and identify any required changes. Do not update files under `deploy/config/extensions` while WBS is running, because that directory is mounted into the running container.

   This upgrade requires no new `.env` values. Preserve `deploy/.env` unchanged.

4. If you modified tracked files such as `deploy/docker-compose.yml` or `deploy/config/Extensions.php`, commit those changes before switching versions.

5. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). The backup procedure stops WBS; continue directly with the migration.

## Migrate

1. While still in your WBS directory, ensure the services are stopped by running.

   ```sh
   docker compose down
   ```

2. Move to the repository root, fetch and check out WBS 6.0.0.

   ```sh
   cd ..
   git remote update
   git checkout deploy@6.0.0
   cd deploy
   ```

3. Reapply any tracked customizations you still need. Keep the WBS 6 files as the base rather than restoring the old files wholesale.

4. Update any user-defined extensions in `deploy/config/extensions` to versions compatible with MediaWiki 1.45.

5. Pull the new images and start WBS.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```
