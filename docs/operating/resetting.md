# Resetting a Wikibase Suite instance

Resetting an instance deletes generated state so Wikibase Suite (WBS) can run setup again. Resetting is required when changes are made to the `.env` file after initial setup. With the exception of `METADATA_CALLBACK`, `.env` values are setup values and should not be changed after initial setup without resetting again.

1. If you have not already, [log in to your server and change to your Wikibase Suite directory](./README.md#accessing-your-wikibase-suite-server).

2. Back up any data and configuration you want to keep.

   If you are resetting a failed initial installation or otherwise do not want to keep existing data or local configuration changes, continue to step 3.

   To keep wiki data, uploaded files, query data, certificates, or QuickStatements data, follow [Back up your data](./backup-and-restore.md#back-up-your-data).

   To keep local configuration changes as a reference, follow [Back up your configuration](./backup-and-restore.md#back-up-your-configuration).

3. Remove the containers and Docker volumes.

   > [!WARNING]
   > This deletes the live Docker volumes. Do not run this command unless your backup is complete or you do not need to keep existing data.

   ```sh
   docker compose down --volumes
   ```

4. Remove the generated configuration files. This tells WBS to run setup again using the current `.env` values and image versions.

   ```sh
   rm -vf config/{LocalSettings.php,wikibase-php.ini,wdqs-frontend-config.json}
   ```

5. Make any needed changes to `.env` before starting WBS again. If you are restoring data from a backup, keep the database values aligned with the backed-up database volume.

   > [!WARNING]
   > If you are preserving existing data, do not change `DB_NAME`, `DB_USER`, or `DB_PASS` during reset unless you also know how to migrate the matching MariaDB credentials manually. The restored database volume keeps the old database credentials.

6. Start WBS once to run setup again.

   ```sh
   docker compose up -d
   ```

   After the Wikibase service starts successfully and `config/LocalSettings.php` exists, stop WBS again:

   ```sh
   docker compose down
   ```

   If you backed up local configuration, review the backed-up generated files and manually copy any local customizations into the new files in `config`. Keep the files created by setup as the base.

7. If you backed up Docker volumes in step 2, follow [Restore from a backup](./backup-and-restore.md#restore-from-a-backup).

8. Start WBS again.

   ```sh
   docker compose up -d
   ```
