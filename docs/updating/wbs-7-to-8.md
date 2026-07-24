# Upgrading from WBS 7 to 8

As of Wikibase Suite 8, the source repository has moved from `wikibase-release-pipeline` to `wikibase-suite`, and the contents of the `deploy/` directory—from which Wikibase Suite was previously operated—have moved to the project root. These instructions preserve the existing installation and its Docker volumes while moving its local configuration.

> [!WARNING]
> On startup, the Wikibase image automatically applies the MediaWiki database schema updates. Do not remove `config/LocalSettings.php` or any Docker volumes as part of this upgrade.

## Prepare

1. Read the changelog entries for the target WBS release and images changed by this upgrade:

   - [WBS 8.0.0](../../CHANGELOG.md#800-2026-07-20)
   - [Wikibase image 8.0.0](../../development/images/wikibase/CHANGELOG.md#800-2026-07-20)
   - [OpenSearch image 1.0.0](../../development/images/opensearch/CHANGELOG.md#100-2026-07-20)
   - [QuickStatements image 1.2.0](../../development/images/quickstatements/CHANGELOG.md#120-2026-07-20)

2. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md).

3. If you modified the tracked `deploy/docker-compose.yml`, commit those changes before switching versions. After checking out WBS 8, reconcile them with the new root `docker-compose.yml`.

## Migrate

1. Stop Wikibase Suite from the old directory.

   ```sh
   cd /path/to/wikibase-release-pipeline/deploy
   docker compose down
   ```

2. From the repository root, fetch and check out the Wikibase Suite 8 release tag.

   ```sh
   cd ..
   git remote update
   git checkout wikibase-suite@8.0.0
   ```

3. Move the existing environment file from `deploy/.env` to the repository root, where WBS 8 expects it.

   ```sh
   mv deploy/.env .env
   ```

4. Copy all contents of the existing `deploy/config/` directory into the new root `config/` directory.

   ```sh
   cp -a deploy/config/. config/
   ```

   The repository tracks the shipped configuration scaffolding. Generated and user-owned `.php`, `.ini`, `.json`, and extension contents under `config/` remain ignored by Git.

5. Prepare the configuration for MediaWiki 1.46.

   The Wikibase image moves from MediaWiki 1.45 to MediaWiki 1.46. Read the [MediaWiki 1.46 UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_46/UPGRADE) and update any user-defined extensions copied to `config/extensions` to versions compatible with MediaWiki 1.46.

6. Start Wikibase Suite from the repository root.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```

The Docker Compose project name remains `wbs-deploy`, so the existing named database, media, query-service, QuickStatements, and certificate volumes continue to be used after the directory move.

Update any scripts, scheduled jobs, or service definitions that previously ran Docker Compose from `wikibase-release-pipeline/deploy` so that they run it from the repository root.
