# Testing


## Testing Locally

You can run the tests in the docker container locally. Testing locally requires the built images.

## To run all
```
make test-all
```

## To only run a single suite
```
make test SUITE=repo
```

In order to test your own instances of the services, make sure to set the following environment variables to the services that should be tested. 


## To only run a specific file in the repo tests
```
make test SUITE=repo FILTER=babel*
```

## Test upgrading between base/bundle images

Tests upgrading between a previous release defined in `test/upgrade/old-versions/` and the newly built base version. Runs the `upgrade` suite.

```
make test-upgrade VERSION=wmde.0 TO_VERSION=versions/wmdeN.env
```

To test upgrading the wikibase-bundle version the following command can be run by changing the `TARGET_WIKIBASE_UPGRADE_IMAGE_NAME` variable.

```
make test-upgrade VERSION=wmde.1-bundle TARGET_WIKIBASE_UPGRADE_IMAGE_NAME=wikibase-bundle TO_VERSION=versions/wmde.N
```

## Test the example

Tests the example configuration by running the `example` suite against it.

```
make test-example SUITE=example
```

## Stopping running containers

In order to stop any running containers from testing there are some Makefile targets that can be used to to this.

Stop and remove the example containers

```sh
make example-stop
```

Stop and remove the test containers

```sh
make test-stop
```

Stop and remove the upgrade containers

```sh
make upgrade-stop
```

##  Variables for testing some other instance
```
WIKIBASE_SERVER=wikibase.svc:80
MW_SERVER=http://wikibase.svc
MW_CLIENT_SERVER=http://wikibase-client.svc
QS_SERVER=http://quickstatements.svc:80
WDQS_FRONTEND_SERVER=wdqs-frontend.svc:80
WDQS_SERVER=wdqs.svc:9999
PINGBACK_BEACON_SERVER=http://mediawiki.svc
WDQS_PROXY_SERVER=http://wdqs-proxy.svc:80
MW_ADMIN_NAME=
MW_ADMIN_PASS=
MW_SCRIPT_PATH=/w
```

## Variables for running the a specific test file against a wikibase.cloud/localhost instance

Create a `Docker/test/selenium/wbaas.minikube.repo.env` file with the following contents

```
WIKIBASE_SERVER=minikube.wbaas.localhost:80
MW_SERVER=http://minikube.wbaas.localhost

MW_ADMIN_NAME=Minikube
MW_ADMIN_PASS=superpassword

MW_SCRIPT_PATH=/w

FILTER=api.js
MOCHA_OPTS_TIMEOUT=3600000000
```

Source the file on each run and execute the `test:run-filter` target on the selenium package in `Docker/test/selenium/`.

```bash
set -o allexport; source wbaas.minikube.repo.env; set +o allexport && npm run test:run-filter
```

For more information on selenium testing see the [README](../../Docker/test/selenium/README.md) file in the selenium folder.
