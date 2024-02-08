# Wikibase Suite (WBS) Docker Compose example configuration

An example of connecting and using all the WBS provided Docker Images using Docker compose.

The core of this example are the following files:

- `docker-compose.yml` Wikibase, Database (MariaDB), WDQS, WDQS Frontend, Elasticsearch, and QuickStatements
- `docker-compose.basic.yml` Wikibase and Database (MariaDB)
- `defaults.env` The default configuration
- `template.env` The template for the most often customized configuration options

**DISCLAIMER: This configuration serves as an example of how the images could be used together but isn't production ready**

## Configure your installation

Copy `template.env` to `.env`, open `.env` in a text editor and follow the instructions in that file, replacing the passwords and secrets with your own.

## Running Wikibase Suite

### All services

Once the configuration step above is completed, run the following command to start the full Wikibase Suite set of services:

```sh
docker compose --env-file defaults.env --env-file .env up
```

Once successfully booted, the front-end services will be available at the following locations:

- Wikibase: http://localhost:8880
- WDQS: http://localhost:8834
- QuickStatements: http://localhost:8840

Note: QuickStatements will not be able to authorize without configuring both `QS_PUBLIC_SCHEME_HOST_AND_PORT` and `WB_PUBLIC_SCHEME_HOST_AND_PORT` to URLs which are accessible both from within the Docker network and on the host machine running Docker. A reverse-proxy service is used to route subdomain names to the related services ports such that you can access the services simply by a set of designated subdomains.  An optional reverse proxy service is included in this example as a means for handling this. This service is optional, and any other reverse proxy service can be used. To use the provided service enable the `nginx-proxy` Docker Compose profile:

```sh
docker compose --env-file defaults.env --env-file .env --profile nginx-proxy up
```

For local testing you will need a domain name that routes to your computer's IP address for this to work. There are `localhost` routed subdomains provided in the default configuration. So, when ran with the `nginx-proxy` profile on a localmachine, the WBS services can be accessed as follows:

- Wikibase: http://wikibase.local.gd
- WDQS: http://wdqs-frontend.local.gd
- QuickStatements: http://quickstatements.local.gd

NOTE: In some cases, due to OS or Internet service provider security settings, these subdomains will not be allowed to route back to the localhost address. In such cases to use these provided URLs it is required to either disable the related security settings, or manually configure a DNS provider (e.g. CloudFlare `1.1.1.1` or Google `8.8.8.8`, etc) in the browser. Chrome provides an option for doing this.

### Selected services

If Elasticsearch, WDQS, or QuickStatements are not needed, they can be removed from the related sections in `docker-compose.yml`, or if none of them are required the basic Wikibase configuration is available as its own example configuration in `docker-compose.basic.yml`. It can be ran as follows:

```sh
docker compose --env-file defaults.env --env-file .env -f docker-compose.basic.yml up
```

This will start up the services defined in [docker-compose.yml](docker-compose.yml): Wikibase, a job runner, and the database. Once successfully booted, Wikibase will be available at the following location:

- Wikibase: http://localhost:8880

## Changing configuration and resetting data

The `.env` file is currently only designed for initial setup. To reflect changes in the `.env` file after initially running the services, the services will need to be stopped and the related docker volumes deleted. DISCLAIMER: THIS IS IRREVERSIBLE AND REMOVES ANY DATA AND CONFIGURATION:

```
docker compose --env-file defaults.env --env-file .env down --volumes
```

After this is done the next `docker compose` run will again use the settings in `.env` for initial configuration.

## Wikibase Suite (WBS) script

In alternative to running the Docker Compose commands above directly, you can use the provided `wbs` convenience shell script:

- `./wbs-precheck` Check if you have a compatible version of Docker, Docker Compose, etc to run WBS
- `./wbs start` Starts WBS services including the nginx-proxy. If running it lists the status of currently running services as well as help.
- `./wbs stop` Stops running WBS services
- `./wbs reset` Reset configuration (.env) and persistent data volumes. Prompts with confirmation for each.

Note that the `./wbs` script currently assumes the use of the `nginx-proxy` service.

## Notes

### Extra install

Looking inside `extra-install.sh`, you see that it executes two scripts which set up an OAuth consumer for quickstatements and creates indices for Elasticsearch. In the volumes section of the wikibase service in [docker-compose.extra.yml](docker-compose.extra.yml), there is one additional script inside the container that automatically sets up the extensions needed for the additional services:

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
