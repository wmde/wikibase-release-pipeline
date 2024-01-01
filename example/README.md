# Wikibase Suite (WBS) docker compose example configuration

The example docker compose configuration consists of two files:

* `docker-compose.yml` contains two services: wikibase and mysql
* `docker-compose.extra.yml` contains additional services such as wdqs, wdqs-frontend, elasticsearch and quickstatements

## Configure your installation

In this directory run the following command to create the default configuration and follow the instructions it shows:

```sh
./wbs
```

This is the output and instructions you should expect:

```text
Welcome to the Wikibase Suite (WBS)

A new default configuration has been copied from .env.template to .env

Next steps:

1. Open the .env file just created, set passwords, your email, and confirm the configuration

2. Run ./wbs start to start WBS

3. Once you see READY navigate to http://localhost:80 and begin testing!

DISCLAIMER: This WBS configuration is an example of how to use the WBS Docker images together,
but not production-ready.
```

## Running Wikibase Suite

After you've completed those initial setup steps, start WBS:

```sh
./wbs start
```

This will start up the services defined in [docker-compose.yml](docker-compose.yml) and [docker-compose.yml](docker-compose.extra.yml).

## Misc: Job runner note

The example `docker-compose.yml` sets up a dedicated job runner which restarts itself after every job, to ensure that changes to the configuration are picked up as quickly as possible.

If you run large batches of edits, this job runner may not be able to keep up with edits.

You can speed it up by setting the `MAX_JOBS` variable in `.env` to run more jobs between restarts (default is 1), if you’re okay with configuration changes not taking effect in the job runner immediately.
Alternatively, you can run several job runners in parallel by using the `--scale` option.

```sh
./wbs compose up -d --wait --scale wikibase-jobrunner=8
```

**DISCLAIMER: This configuration serves as an example of how the images could be used together but isn't production ready**
