# Upgrading from WBS 3 to 4

This upgrade follows the standard major-version procedure and preserves the existing installation and Docker volumes. It upgrades the Wikibase image from MediaWiki 1.42 to MediaWiki 1.43 and changes routing for several services.

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. Read the changelog entries for the target WBS release and images changed by this upgrade:

   - [WBS 4.2.1](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%404.2.1/deploy/CHANGELOG.md#421-2025-07-11)
   - [Wikibase image 4.1.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%404.2.1/build/wikibase/CHANGELOG.md#410-2025-06-13)
   - [Elasticsearch image 1.0.2](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%404.2.1/build/elasticsearch/CHANGELOG.md#102-2025-03-20)
   - [Query service image 2.0.2](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%404.2.1/build/wdqs/CHANGELOG.md#202-2025-03-20)
   - [Query service frontend image 2.0.0](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%404.2.1/build/wdqs-frontend/CHANGELOG.md#200-2025-03-20)
   - [QuickStatements image 1.0.2](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%404.2.1/build/quickstatements/CHANGELOG.md#102-2025-03-20)

2. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). Run the backup commands from the existing `deploy/` directory.

3. If you modified tracked files such as `deploy/docker-compose.yml` or files under `deploy/config`, commit those changes before switching versions. After checking out WBS 4, reconcile them with the files in the new release.

## Migrate

1. Stop Wikibase Suite from the `deploy/` directory if it is still running.

   ```sh
   cd /path/to/wikibase-release-pipeline/deploy
   docker compose down
   ```

2. From the repository root, fetch and check out WBS 4.2.1 so the installation includes all WBS 4 minor and patch updates.

   ```sh
   cd ..
   git remote update
   git checkout deploy@4.2.1
   cd deploy
   ```

3. In `deploy/.env`, add `WDQS_PUBLIC_HOST` using the existing value of `WDQS_FRONTEND_PUBLIC_HOST`.

   ```dotenv
   WDQS_PUBLIC_HOST=query.wikibase.example
   ```

   Replace the example with the wiki's existing query frontend hostname. `WDQS_FRONTEND_PUBLIC_HOST` and `QUICKSTATEMENTS_PUBLIC_HOST` are no longer used and may be removed; QuickStatements now runs under the existing `WIKIBASE_PUBLIC_HOST`. Preserve all other existing values.

4. Review the routing changes.

   Default service URLs changed in WBS 4:

   - `https://wikibase.example` — Wikibase on MediaWiki
   - `https://wikibase.example/w/rest.php` — MediaWiki REST API, including the Wikibase REST API
   - `https://query.wikibase.example` — query service web interface
   - `https://query.wikibase.example/sparql` — query service SPARQL endpoint
   - `https://wikibase.example/tools/quickstatements` — QuickStatements

   The `wdqs-proxy` image was removed. Traefik now routes query service HTTP traffic. The `wdqs-frontend` environment variables also changed; see the [query service frontend environment-variable documentation](../images/wdqs-frontend/README.md#environment-variables).

5. Prepare the configuration for MediaWiki 1.43.

   Read the [MediaWiki 1.43 UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_43/UPGRADE) and update any user-defined extensions in `deploy/config/extensions` to versions compatible with MediaWiki 1.43.

6. Pull the new images and start Wikibase Suite.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```
