# Operating Wikibase Suite (WBS)

Operating WBS includes keeping an existing instance current, protecting its data, and diagnosing problems.

- [Updating and Upgrading](./updating.md)
- [Backing Up and Restoring](./backup-and-restore.md)
- [Troubleshooting](./troubleshooting.md)

## Accessing your WBS server

For most operating tasks, first connect to the server where WBS is installed and change to its installation directory.

1. Open a terminal on your computer and log in with the server account used during installation (usually `root`). Replace `SERVER_IP_ADDRESS` with your server's public IP address:

   ```sh
   ssh root@SERVER_IP_ADDRESS
   ```

2. Change to the directory containing your WBS installation. Use the command that matches the version you currently run.

   WBS 7 or earlier:

   ```sh
   cd ~/wikibase-release-pipeline/deploy
   ```

   WBS 8 or later:

   ```sh
   cd ~/wikibase-suite
   ```

These are the default locations used by the installation instructions. If you chose a different location during installation, use that location instead.
