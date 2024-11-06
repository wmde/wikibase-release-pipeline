# Stopping and Resetting

## Stopping

To stop, use

```sh
docker compose stop
```

## Resetting the configuration

Most values set in `.env` are written into the respective containers after you run `docker compose up` for the first time.

If you want to reset the configuration while retaining your existing data:

1. Make any needed changes to the values in the `.env` file copied from `template.env` above. NOTE: Do not change `DB_*` values unless you are also [re-creating the database](./07_remove.md#removing-wikibase-suite-completely-with-all-its-data).
2. Delete your `LocalSettings.php` file from the `./config` directory.
3. Remove and re-create containers:

```sh
docker compose down
docker compose up
```

