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

2. Prepare MediaWiki 1.46-compatible versions of any user-defined extensions. Do not replace files under `deploy/config/extensions` while Wikibase Suite is running, because that directory is mounted into the running container.

3. If you modified the tracked `deploy/docker-compose.yml`, commit those changes before switching versions.

4. Back up your data and configuration. See [Backup and restore](../backup-and-restore.md). The backup procedure stops Wikibase Suite; continue directly with the migration.

## Migrate

1. Ensure Wikibase Suite services are stopped.

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

3. Reconcile any committed `deploy/docker-compose.yml` customizations with the new root `docker-compose.yml`.

4. Move the existing environment file from `deploy/.env` to the repository root, where WBS 8 expects it.

   ```sh
   mv deploy/.env .env
   ```

5. Copy all contents of the existing `deploy/config/` directory into the new root `config/` directory.

   ```sh
   cp -a deploy/config/. config/
   ```

6. Replace user-defined extensions copied to `config/extensions` with the MediaWiki 1.46-compatible versions prepared earlier.

7. Start Wikibase Suite from the repository root.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```

8. After confirming that the upgraded services are up and healthy, remove the obsolete `deploy/` directory.

   ```sh
   rm -r deploy
   ```

   The Docker Compose project name remains wbs-deploy, so the existing named database, media, query-service, QuickStatements, and certificate volumes continue to be used after the directory move.

> [!NOTE]
> If you have custom scripts, scheduled jobs, or service definitions that previously ran Docker Compose from `wikibase-release-pipeline/deploy`, they must now reference `wikibase-release-pipeline/`.
