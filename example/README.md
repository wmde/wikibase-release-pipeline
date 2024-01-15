# Wikibase Suite (WBS) docker compose example configuration

The example docker compose configuration consists of three files:

* `docker-compose.yml` Wikibase and Database (MariaDB)
* `docker-compose.extra.yml` WDQS, WDQS Frontend, Elasticsearch and QuickStatements
* `docker-compose.nginx-proxy.yml` Contains the nginx-proxy service for mapping subdomains to applications and services. This works as-is for local testing and with careful review, could be used in production. This can also be replaced by any other reverse proxy service configured appropriately.

We recommend you go through `docker-compose.extra.yml` and remove any unwanted services.

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

**DISCLAIMER: This configuration serves as an example of how the images could be used together but isn't production ready**
