# Uninstalling Wikibase Suite

Uninstalling Wikibase Suite (WBS) removes the containers, Docker volumes, and generated configuration files for the instance. Unlike resetting, uninstalling does not start WBS again.

1. If you have not already, [log in to your server and change to your Wikibase Suite directory](./README.md#accessing-your-wikibase-suite-server).

2. If there is anything you want to keep, follow [Back up your data](./backup-and-restore.md#back-up-your-data) or [Back up your configuration](./backup-and-restore.md#back-up-your-configuration) before continuing.

3. Remove the containers, Docker volumes, and generated configuration files.

   > [!WARNING]
   > This permanently deletes the live Docker volumes. Do not continue unless your backup is complete or you do not need to keep the instance data.

   ```sh
   docker compose down --volumes
   rm -vf config/{LocalSettings.php,wikibase-php.ini,wdqs-frontend-config.json}
   ```

This removes the instance and its data from the server. If you later start WBS again from the same directory, it will run setup as a new instance.
