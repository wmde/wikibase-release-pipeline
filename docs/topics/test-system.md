# Test-system


## Configuration

The test-system is currently using a non versioned copy of the [example](../../example/README.md) folder deployed to `wb-product-testing.wikidata-dev.eqiad.wmflabs`.

Files are located under the `/opt/` folder and for keeping some kind of papertrail a copy of the version to be tested is usually created as `/opt/wmde.1`, `/opt/wmde.2` etc.

```
someone@wb-product-testing:/opt/wmde.2$ tree
.
├── example-fedprops
│   ├── docker-compose.extra.yml
│   ├── docker-compose.yml
│   ├── extra-install.sh
│   ├── local.env
│   ├── LocalSettings.php
│   ├── README.md
│   └── template.env
└── example-full
    ├── docker-compose.extra.yml
    ├── docker-compose.yml
    ├── extra-install.sh
    ├── LocalSettings.php
    ├── README.md
    └── template.env

2 directories, 13 files

```

## Update with new release


Normally `example-full` is the environment you want to use. The folder should contain an `.env` file that can be updated with the new image versions produced by the [release-pipeline](https://github.com/orgs/wmde/packages?repo_name=wikibase-release-pipeline).

### 1. stop the containers 

```sh
$ docker-compose -f docker-compose.yml -f docker-compose.extra.yml down
```

### 2. Update image version and source variables to shell

Example for workflow run [1157808966](https://github.com/wmde/wikibase-release-pipeline/actions/runs/1157808966).

```
WIKIBASE_IMAGE_NAME=ghcr.io/wmde/wikibase:1157808966
WDQS_IMAGE_NAME=ghcr.io/wmde/wdqs:1157808966
WDQS_FRONTEND_IMAGE_NAME=ghcr.io/wmde/wdqs-frontend:1157808966
ELASTICSEARCH_IMAGE_NAME=ghcr.io/wmde/elasticsearch:1157808966
WIKIBASE_BUNDLE_IMAGE_NAME=ghcr.io/wmde/wikibase-bundle:1157808966
QUICKSTATEMENTS_IMAGE_NAME=ghcr.io/wmde/quickstatements:1157808966
WDQS_PROXY_IMAGE_NAME=ghcr.io/wmde/wdqs-proxy:1157808966
MYSQL_IMAGE_NAME=mariadb:10.3
```

Source the updated `.env` file with the new variables 
```sh
$ set -o allexport; source .env; set +o allexport
```

Optionally confirm that it worked by echoing the variable

```sh
$ echo $WIKIBASE_IMAGE_NAME
```

### 3. start containers again 

```sh
$ docker-compose -f docker-compose.yml -f docker-compose.extra.yml up -d
```

### 4. Check logs to see what happens

```sh
$ docker-compose -f docker-compose.yml -f docker-compose.extra.yml logs -f
```



