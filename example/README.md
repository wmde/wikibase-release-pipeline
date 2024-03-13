# Wikibase Suite (WBS) Docker Compose example configuration

An example of connecting and using all the WBS provided Docker Images using Docker compose.

The core of this example are the following files:

- `docker-compose.yml` Wikibase, Database (MariaDB), WDQS, WDQS Frontend, Elasticsearch, and QuickStatements
- `template.env` The configuration template

**DISCLAIMER: This configuration serves as an example of how the images could be used together but isn't production ready**

## ⚙️ Configure

The first step to running WBS is review and update the configuration to reflect the needs of your own production environment. 

1. Copy `template.env` to `.env`
2. Open `.env` in a text editor and create new passwords and a secret according to the guidance. Also read the notes there and review the other highlighted configuration options.

## 🏃🏽‍♀️ Run

After completing the configuration steps above, run the following command to start the full Wikibase Suite set of services:

 ```sh
 docker compose up -d --wait
 ```

 Once successfully booted, the front-end services will be available at the following locations:

 - Wikibase: http://localhost:8880
 - WDQS: http://localhost:8834
 - QuickStatements: http://localhost:8840

Note: QuickStatements will not be able to authorize without configuring both `QS_PUBLIC_SCHEME_HOST_AND_PORT` and `WB_PUBLIC_SCHEME_HOST_AND_PORT` to URLs which are accessible both from within the Docker network and on the host machine running Docker. A reverse-proxy service is used to route subdomain names to the related services ports such that you can access the services simply by a set of designated subdomains.  An optional reverse proxy service is included in this example as a means for handling this. This service is optional, and any other reverse proxy service can be used. To use the provided service enable the `nginx-proxy` Docker Compose profile:

```sh
docker compose --profile nginx-proxy up -d --wait
```

When ran using this provided `nginx-proxy` setup the WBS services can be accessed at the configured host addresses.

If Elasticsearch, WDQS, or QuickStatements are not required they can be removed from the related sections in `docker-compose.yml`.

## ⚠️ Updating configuration and resetting data

The `.env` file is currently only designed for initial setup. To reflect changes in the `.env` file after initially running the services, the services will need to be stopped and the related docker volumes deleted. DISCLAIMER: THIS IS CURRENTLY IRREVERSIBLE AND REMOVES ANY DATA AND CONFIGURATION:

```
docker compose down --volumes
```

After this is done the next `docker compose` run will again use the settings in `.env` for initial configuration.

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
