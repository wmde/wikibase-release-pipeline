# Wikibase Suite (WBS) docker compose example configuration

The essential parts of the example docker compose configuration is two docker compose files:

* `docker-compose.yml` Wikibase and Database (MariaDB)
* `docker-compose.extra.yml` WDQS, WDQS Frontend, Elasticsearch and QuickStatements

**DISCLAIMER: This configuration serves as an example of how the images could be used together but isn't production ready**

## Configure your installation

Copy `.env.template` to `.env` and replace the passwords and secrets with your own.

## Running Wikibase Suite

To run the full Wikibase Suites of services run the following command:

```sh
docker compose --env-file .env.defaults --env-file .env -f docker-compose.yml -f docker-compose.extra.yml up
```

If you don't need Elasticsearch, WDQS, or QuickStatements you can remove those sections in `docker-compose.extra.yml`, or not use this file at all and use the basic Wikibase configuration below if you need none of them.

QuickStatements will not be able to authorize without configuring both `QS_PUBLIC_SCHEME_HOST_AND_PORT` and `WB_PUBLIC_SCHEME_HOST_AND_PORT` to URLs which are accessible both within the Docker containers and on the host machine running Docker. An optional WBS provided nginx-proxy configuration is included in `docker-compose.nginx-proxy.yml` as one means for doing this in local testing. To add that service add it as the 3rd compose file when running, e.g.:

```sh
docker compose --env-file .env.defaults --env-file .env -f docker-compose.nginx-proxy.yml -f docker-compose.yml -f docker-compose.extra.yml up
```
Once successfully booted, the front-end services will be available at the following locations:

- Wikibase: http://localhost:8880
- WDQS: http://localhost:8834
- QuickStatements: http://localhost:8840

A reverse-proxy service is used to route subdomain names to the related services ports such that you can access the service simply by the designated subdomain. The provided proxy service works for local testing and with careful review, could be used in production. In local testing however you will need a domain name that routes to your computer's ip address.

This service can be replaced by any other reverse proxy service configured appropriately.

## Running basic Wikibase

Alternatively, if you don't need the full WBS set of services, you can run the Wikibase instance on port 8880 only with the following command:

```sh
docker --env-file .env.defaults --env-file .env -f docker-compose.yml compose up
```

This will start up the services defined in [docker-compose.yml](docker-compose.yml), a Wikibase instance, database and a job runner.

Once successfully booted, the front-end services will be available at the following locations:

- Wikibase: http://localhost:8880

## Wikibase Suite (WBS) script

In alternative to the somewhat verbose Docker compose commands above you can use the `wbs` shell script provided for convenience:

- `./wbs-precheck` Check if you have a compatible version of Docker, Docker compose, etc to run WBS
- `./wbs start` Starts WBS services including the nginx-proxy. If running it lists the status of currently running services as well as help.
- `./wbs stop` Stops running WBS services
- `./wbs reset` Reset configuration (.env) and persistent data volumes. Prompts with confirmation for each.

## Notes

### Extra install

Looking inside `extra-install.sh`, you see that it executes two scripts which set up an OAuth consumer for quickstatements and creates indices for Elasticsearch.

* In the volumes section of the wikibase service in [docker-compose.extra.yml](docker-compose.extra.yml), there is one additional script inside the container that automatically sets up the extensions needed for the additional services.

  ```yml
  - ./extra-install.sh:/extra-install.sh
  ```

### Job runner

The example `docker-compose.yml` sets up a dedicated job runner which restarts itself after every job, to ensure that changes to the configuration are picked up as quickly as possible.

If you run large batches of edits, this job runner may not be able to keep up with edits.

You can speed it up by increasing the `MAX_JOBS` variable to run more jobs between restarts, if you’re okay with configuration changes not taking effect in the job runner immediately.
Alternatively, you can run several job runners in parallel by using the `--scale` option.

```sh
docker compose up --scale wikibase-jobrunner=8
```
