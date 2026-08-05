# Upgrading Wikibase Suite (WBS) from 3 to 4

This guide explains how to upgrade Wikibase Suite (WBS) from version 3 to 4 while preserving the existing installation and Docker volumes. It upgrades the Wikibase image from MediaWiki 1.42 to MediaWiki 1.43 and changes routing for several services.

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. If you have not already, [log in to your server and change to your WBS directory](../README.md#accessing-your-wbs-server).

2. Read the `CHANGELOG` entries for the target WBS release and images changed by this upgrade:

   - [WBS 4.2.1](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%404.2.1/deploy/CHANGELOG.md#421-2025-07-11)
   - [Wikibase image changelog](https://github.com/wmde/wikibase-suite/blob/main/development/images/wikibase/CHANGELOG.md)
   - [Elasticsearch image 1.0.2](https://github.com/wmde/wikibase-release-pipeline/blob/deploy%404.2.1/build/elasticsearch/CHANGELOG.md#102-2025-03-20)
   - [Query Service image changelog](https://github.com/wmde/wikibase-suite/blob/main/development/images/wdqs/CHANGELOG.md)
   - [Query Service frontend image changelog](https://github.com/wmde/wikibase-suite/blob/main/development/images/wdqs-frontend/CHANGELOG.md)
   - [QuickStatements image changelog](https://github.com/wmde/wikibase-suite/blob/main/development/images/quickstatements/CHANGELOG.md)

3. Plan the required `.env` change. During the migration, you will add `WDQS_PUBLIC_HOST` using the existing value of `WDQS_FRONTEND_PUBLIC_HOST`.

   ```dotenv
   WDQS_PUBLIC_HOST=query.wikibase.example
   ```

   Replace the example with the wiki's existing query frontend hostname. After backing up the existing configuration, `WDQS_FRONTEND_PUBLIC_HOST` and `QUICKSTATEMENTS_PUBLIC_HOST` can be removed; QuickStatements now runs under the existing `WIKIBASE_PUBLIC_HOST`. Preserve all other existing values.

4. Review the routing changes.

   Default service URLs changed in WBS 4:

   - `https://wikibase.example` — Wikibase on MediaWiki
   - `https://wikibase.example/w/rest.php` — MediaWiki REST API, including the Wikibase REST API
   - `https://query.wikibase.example` — Query Service web interface
   - `https://query.wikibase.example/sparql` — Query Service SPARQL endpoint
   - `https://wikibase.example/tools/quickstatements` — QuickStatements

   The `wdqs-proxy` image was removed. Traefik now routes Query Service HTTP traffic. The `wdqs-frontend` environment variables also changed; see the [Query Service frontend environment-variable documentation](../../images/wdqs-frontend/README.md#environment-variables).

5. Read the [MediaWiki 1.43 UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_43/UPGRADE) and identify any required changes. Do not update files under `deploy/config/extensions` while WBS is running, because that directory is mounted into the running container.

6. If you modified tracked files such as `deploy/docker-compose.yml` or files under `deploy/config`, commit those changes before switching versions.

7. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). The backup procedure stops WBS; continue directly with the migration.

## Migrate

1. While still in your WBS directory, ensure the services are stopped by running.

   ```sh
   docker compose down
   ```

2. Move to the repository root, fetch and check out WBS 4.2.1. This target includes all WBS 4 minor and patch updates.

   ```sh
   cd ..
   git remote update
   git checkout deploy@4.2.1
   cd deploy
   ```

3. Reapply any tracked customizations you still need. Keep the WBS 4 files as the base rather than restoring the old files wholesale.

4. In `deploy/.env`, add `WDQS_PUBLIC_HOST` using the existing value of `WDQS_FRONTEND_PUBLIC_HOST`. Remove `WDQS_FRONTEND_PUBLIC_HOST` and `QUICKSTATEMENTS_PUBLIC_HOST`, then preserve all other existing values.

5. Update any user-defined extensions in `deploy/config/extensions` to versions compatible with MediaWiki 1.43.

6. Pull the new images and start WBS.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```
