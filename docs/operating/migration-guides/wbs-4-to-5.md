# Upgrading from WBS 4 to 5

This upgrade follows the standard major-version procedure and preserves the existing installation and Docker volumes. It upgrades the Wikibase image from MediaWiki 1.43 to MediaWiki 1.44 and moves metadata callback handling into the Wikibase image.

If you have not already, [log in to your server and change to your Wikibase Suite directory](../README.md#accessing-your-wikibase-suite-server).

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. Read the changelog entries for the target WBS release and images changed by this upgrade:

   - [WBS 5.0.1](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%405.0.1/deploy/CHANGELOG.md#501-2025-08-26)
   - [Wikibase image 5.0.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%405.0.1/build/wikibase/CHANGELOG.md#500-2025-07-24)

2. Set `METADATA_CALLBACK` in the existing `deploy/.env` file. Choose `true` to opt in or `false` to opt out.

   ```dotenv
   METADATA_CALLBACK=false
   ```

   Do not replace the existing `.env` file or change its other setup values.

3. Read the [MediaWiki 1.44 UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_44/UPGRADE) and identify any required changes. Do not update files under `deploy/config/extensions` while Wikibase Suite is running, because that directory is mounted into the running container.

   This upgrade requires no other new `.env` values. Preserve the other values in `deploy/.env`.

4. If you modified tracked files such as `deploy/docker-compose.yml` or `deploy/config/Extensions.php`, commit those changes before switching versions.

5. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). The backup procedure stops Wikibase Suite; continue directly with the migration.

## Migrate

1. From your Wikibase Suite directory, ensure the services are stopped.

   ```sh
   docker compose down
   ```

2. From the repository root, fetch and check out WBS 5.0.1. This patch release corrects the Wikibase image reference shipped in WBS 5.0.0.

   ```sh
   cd ..
   git remote update
   git checkout deploy@5.0.1
   cd deploy
   ```

3. Reconcile any committed customizations with the files in the new release.

4. Update any user-defined extensions in `deploy/config/extensions` to versions compatible with MediaWiki 1.44.

5. Pull the new images and start Wikibase Suite.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```
