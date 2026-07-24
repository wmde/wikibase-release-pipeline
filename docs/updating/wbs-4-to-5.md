# Upgrading from WBS 4 to 5

This upgrade follows the standard major-version procedure and preserves the existing installation and Docker volumes. It upgrades the Wikibase image from MediaWiki 1.43 to MediaWiki 1.44 and moves metadata callback handling into the Wikibase image.

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. Read the changelog entries for the target WBS release and images changed by this upgrade:

   - [WBS 5.0.1](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%405.0.1/deploy/CHANGELOG.md#501-2025-08-26)
   - [Wikibase image 5.0.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%405.0.1/build/wikibase/CHANGELOG.md#500-2025-07-24)

2. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). Run the backup commands from the existing `deploy/` directory.

3. If you modified tracked files such as `deploy/docker-compose.yml` or `deploy/config/Extensions.php`, commit those changes before switching versions. After checking out WBS 5, reconcile them with the files in the new release.

## Migrate

1. Stop Wikibase Suite from the `deploy/` directory if it is still running.

   ```sh
   cd /path/to/wikibase-release-pipeline/deploy
   docker compose down
   ```

2. From the repository root, fetch and check out WBS 5.0.1. This patch release corrects the Wikibase image reference shipped in WBS 5.0.0.

   ```sh
   cd ..
   git remote update
   git checkout deploy@5.0.1
   cd deploy
   ```

3. Set `METADATA_CALLBACK` in the existing `deploy/.env` file. Choose `true` to opt in or `false` to opt out.

   ```dotenv
   METADATA_CALLBACK=false
   ```

   Do not replace the existing `.env` file or change its other setup values.

4. Prepare the configuration for MediaWiki 1.44.

   Read the [MediaWiki 1.44 UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_44/UPGRADE) and update any user-defined extensions in `deploy/config/extensions` to versions compatible with MediaWiki 1.44.

   This upgrade requires no other new `.env` values. Preserve the other values in `deploy/.env`.

5. Pull the new images and start Wikibase Suite.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```
