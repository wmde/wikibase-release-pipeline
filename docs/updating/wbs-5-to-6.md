# Upgrading from WBS 5 to 6

This upgrade follows the standard major-version procedure and preserves the existing installation and Docker volumes. It upgrades the Wikibase image from MediaWiki 1.44 to MediaWiki 1.45.

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. Read the changelog entries for the target WBS release and images changed by this upgrade:

   - [WBS 6.0.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%406.0.0/deploy/CHANGELOG.md#600-2026-02-16)
   - [Wikibase image 6.0.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%406.0.0/build/wikibase/CHANGELOG.md#600-2026-02-16)
   - [Query service image 2.1.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%406.0.0/build/wdqs/CHANGELOG.md#210-2026-02-16)
   - [Query service frontend image 2.1.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%406.0.0/build/wdqs-frontend/CHANGELOG.md#210-2026-02-16)
   - [QuickStatements image 1.1.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%406.0.0/build/quickstatements/CHANGELOG.md#110-2026-02-16)

2. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). Run the backup commands from the existing `deploy/` directory.

3. If you modified tracked files such as `deploy/docker-compose.yml` or `deploy/config/Extensions.php`, commit those changes before switching versions. After checking out WBS 6, reconcile them with the files in the new release.

## Migrate

1. Stop Wikibase Suite from the `deploy/` directory if it is still running.

   ```sh
   cd /path/to/wikibase-release-pipeline/deploy
   docker compose down
   ```

2. From the repository root, fetch and check out WBS 6.0.0.

   ```sh
   cd ..
   git remote update
   git checkout deploy@6.0.0
   cd deploy
   ```

3. Prepare the configuration for MediaWiki 1.45.

   Read the [MediaWiki 1.45 UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_45/UPGRADE) and update any user-defined extensions in `deploy/config/extensions` to versions compatible with MediaWiki 1.45.

   This upgrade requires no new `.env` values. Preserve `deploy/.env` unchanged.

4. Pull the new images and start Wikibase Suite.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```
