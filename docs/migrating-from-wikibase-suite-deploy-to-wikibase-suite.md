# Moving an existing Wikibase Suite installation to the repository root

Wikibase Suite 8 moves the Docker Compose product from the `deploy/` subdirectory to the repository root. These instructions preserve the existing installation and its Docker volumes while moving its local configuration.

> [!IMPORTANT]
> Do not run the installer for an existing instance. The installer is for first-time setup.

## Before you start

Back up your data and configuration before upgrading. See [Backup and restore](./backup-and-restore.md).

The migration moves:

- `deploy/.env` to `.env`
- all contents of `deploy/config/` to `config/`
- `deploy/docker-compose.override.yml`, if present, to the repository root

If you modified the tracked `deploy/docker-compose.yml`, commit those changes before switching versions and reconcile them with the root `docker-compose.yml` during the upgrade.

## Migration steps

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

3. Move the existing environment file to the repository root.

   ```sh
   mv deploy/.env .env
   ```

4. Copy the complete existing configuration into the new root configuration directory.

   ```sh
   cp -a deploy/config/. config/
   ```

   The repository tracks the shipped configuration scaffolding. Generated and user-owned `.php`, `.ini`, `.json`, and extension contents under `config/` remain ignored by Git.

5. If present, move the local Compose override.

   ```sh
   mv deploy/docker-compose.override.yml docker-compose.override.yml
   ```

6. Review `.env.example` for new required settings and reconcile any committed Compose customizations.

7. Start Wikibase Suite from the repository root.

   ```sh
   docker compose pull
   docker compose up -d
   docker compose ps
   ```

The Compose project name remains `wbs-deploy`, so the existing named database, media, query-service, QuickStatements, and certificate volumes continue to be used after the directory move.

Update any scripts, scheduled jobs, or service definitions that previously ran Docker Compose from `wikibase-release-pipeline/deploy` so that they run it from the repository root.
