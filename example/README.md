# Example docker compose configuration

The example docker compose configuration consists of one file, `docker-compose.yml`, which contains the services:

- wikibase
- job runner
- mysql (actually MariaDB)
- elasticsearch
- wdqs
- wdqs-frontend
- wdqs-proxy
- wdqs-updater
- quickstatements

**This configuration serves as an example of how the images could be used together and isn't production ready**

## Configure your installation

Copy `template.env` to `.env` and replace the passwords and secrets with your own.

## Running a Wikibase instance

To run a Wikibase instance on port 80 run the following command:

```
docker compose up --wait
```

This will start up the services defined in [docker-compose.yml](docker-compose.yml), listed above. Feel free to remove any unwanted or unneeded services from `docker-compose.yml`, but be advised this is the configuration we test.

## Job runner

The example `docker-compose.yml` sets up a dedicated job runner which restarts itself after every job, to ensure that changes to the configuration are picked up as quickly as possible.

If you run large batches of edits, this job runner may not be able to keep up with edits.

You can speed it up by increasing the `JOBRUNNER_MAX_JOBS` variable to run more jobs between restarts, if you’re okay with configuration changes not taking effect in the job runner immediately. Alternatively, you can run several job runners in parallel by using the `--scale` option.

```sh
docker compose up --scale wikibase-jobrunner=8
```
