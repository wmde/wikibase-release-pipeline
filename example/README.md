# Example docker-compose configuration

The example docker-compose configuration consists of two files

* `docker-compose.yml` contains two services wikibase and mysql
* `docker-compose.extra.yml` contains additional services such as wdqs, wdqs-frontend, elasticsearch and quickstatements 

**We recommend you go through `docker-compose.extra.yml` and remove any unwanted services.**

## Configure your installation

Copy the `template.env` to `.env` and replace the passwords and secrets with your own.

## Running a Wikibase instance

To run a single Wikibase instance run and you should be able to reach it on port 80.

```
docker-compose up
```

## Running additional services

The wikibase bundle comes with some additional services that can be enabled.

- wdqs
- wdqs-updater
- wdqs-frontend
- quickstatements
- elasticsearch

### 1. Rename the `docker-compose.extra.yml` file
In order to enable additional services in the Wikibase bundle rename `docker-compose.extra.yml` to `docker-compose.override.yml` which will make docker-compose also use this when started with `docker-compose up`

### 2. Uncomment the extra-install scripts in `docker-compose.yml` 

In the volumes section of the wikibase service there is one commented line that allow the additional services to start automatically.

```
- ./extra-install.sh:/extra-install.sh
```

Looking inside extra-install.sh it executes two scripts that sets up an OAuth consumer for quickstatements and creates indicies for elasticsearch.

### 3. Run the configuration 

```
docker-compose up
```