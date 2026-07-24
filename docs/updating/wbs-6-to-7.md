# Upgrading from WBS 6 to 7

This upgrade follows the standard major-version procedure and preserves the existing installation and Docker volumes. It updates MediaWiki and the bundled extensions within the MediaWiki 1.45 release line.

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. Read the changelog entries for the target WBS release and images changed by this upgrade:

   - [WBS 7.0.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%407.0.0/deploy/CHANGELOG.md#700-2026-04-20)
   - [Wikibase image 7.0.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%407.0.0/build/wikibase/CHANGELOG.md#700-2026-04-20)

2. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). Run the backup commands from the existing `deploy/` directory.

3. If you modified tracked files such as `deploy/docker-compose.yml` or `deploy/config/Extensions.php`, commit those changes before switching versions. After checking out WBS 7, reconcile them with the files in the new release.

## Migrate

1. Stop Wikibase Suite from the `deploy/` directory if it is still running.

   ```sh
   cd /path/to/wikibase-release-pipeline/deploy
   docker compose down
   ```

2. From the repository root, fetch and check out WBS 7.0.0.

   ```sh
   cd ..
   git remote update
   git checkout deploy@7.0.0
   cd deploy
   ```

3. Prepare the configuration for WBS 7.

   This upgrade requires no new `.env` values. Preserve `deploy/.env` unchanged.

   WikibaseEdtf remains bundled but is no longer loaded by default. If the wiki uses the EDTF data type, uncomment this line in `config/Extensions.php`:

   ```php
   wfLoadExtension( 'WikibaseEdtf' );
   ```

4. Pull the new images and start Wikibase Suite.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```

5. If the wiki uses `mul` values, wait for the upgraded services to become healthy, then recreate and repopulate the Elasticsearch index.

   WBS 7 enables the `mul` language code. Existing content will not appear in typeahead results for `mul` values until the index is recreated and repopulated.

   ```sh
   docker compose exec wikibase php extensions/CirrusSearch/maintenance/UpdateSearchIndexConfig.php --startOver
   docker compose exec wikibase php extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipLinks --indexOnSkip
   docker compose exec wikibase php extensions/CirrusSearch/maintenance/ForceSearchIndex.php --skipParse
   ```

   Reindexing may take a significant amount of time on a large wiki. If the wiki does not use `mul` values, this step can be deferred until that functionality is needed.
