# Upgrading from WBS 5 to 6

This upgrade follows the standard major-version procedure and preserves the existing installation and Docker volumes. It upgrades the Wikibase image from MediaWiki 1.44 to MediaWiki 1.45.

If you have not already, [log in to your server and change to your Wikibase Suite directory](../README.md#accessing-your-wikibase-suite-server).

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. Read the changelog entries for the target WBS release and images changed by this upgrade:

   - [WBS 6.0.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%406.0.0/deploy/CHANGELOG.md#600-2026-02-16)
   - [Wikibase image 6.0.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%406.0.0/build/wikibase/CHANGELOG.md#600-2026-02-16)
   - [Query service image 2.1.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%406.0.0/build/wdqs/CHANGELOG.md#210-2026-02-16)
   - [Query service frontend image 2.1.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%406.0.0/build/wdqs-frontend/CHANGELOG.md#210-2026-02-16)
   - [QuickStatements image 1.1.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%406.0.0/build/quickstatements/CHANGELOG.md#110-2026-02-16)

2. Read the [MediaWiki 1.45 UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_45/UPGRADE) and identify any required changes. Do not update files under `deploy/config/extensions` while Wikibase Suite is running, because that directory is mounted into the running container.

   This upgrade requires no new `.env` values. Preserve `deploy/.env` unchanged.

3. If you modified tracked files such as `deploy/docker-compose.yml` or `deploy/config/Extensions.php`, commit those changes before switching versions.

4. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). The backup procedure stops Wikibase Suite; continue directly with the migration.

## Migrate

1. From your Wikibase Suite directory, ensure the services are stopped.

   ```sh
   docker compose down
   ```

2. From the repository root, fetch and check out WBS 6.0.0.

   ```sh
   cd ..
   git remote update
   git checkout deploy@6.0.0
   cd deploy
   ```

3. Reconcile any committed customizations with the files in the new release.

4. Update any user-defined extensions in `deploy/config/extensions` to versions compatible with MediaWiki 1.45.

5. Pull the new images and start Wikibase Suite.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```
