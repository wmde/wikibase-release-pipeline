# Example docker-compose configuration

The example docker-compose configuration consists of two files

* `docker-compose.yml` contains two services: wikibase and mysql
* `docker-compose.extra.yml` contains additional services such as: wdqs, wdqs-frontend, elasticsearch and quickstatements 

**We recommend you go through `docker-compose.extra.yml` and remove any unwanted services.**

## Configure your installation

Copy the `template.env` to `.env` and replace the passwords and secrets with your own.

## Running a Wikibase instance

To run a single Wikibase instance on port 80 run the command:

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

### 1. Uncomment the extra-install scripts in `docker-compose.yml` 

In the volumes section of the wikibase service there is one commented line that automatically sets up the extensions needed for the additional services.

```
- ./extra-install.sh:/extra-install.sh
```

Looking inside extra-install.sh it executes two scripts that sets up an OAuth consumer for quickstatements and creates indicies for elasticsearch.

### 2. Uncomment MW_ELASTIC_HOST and MW_ELASTIC_PORT in `docker-compose.yml`

To configure wikibase to use elasticsearch we need to uncomment the following two lines in the example docker-compose.yml file
```
      - MW_ELASTIC_HOST=elasticsearch.svc
      - MW_ELASTIC_PORT=9200
``` 

### 3. Run with the extra configuration

```
docker-compose -f docker-compose.yml -f docker-compose.extra.yml up
```
