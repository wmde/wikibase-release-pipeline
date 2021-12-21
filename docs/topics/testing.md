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
make test-upgrade VERSION=wmde.0
```

To test upgrading the wikibase-bundle version the following command can be run by changing the `TARGET_WIKIBASE_UPGRADE_IMAGE_NAME` variable.

```
make test-upgrade VERSION=wmde.1-bundle TARGET_WIKIBASE_UPGRADE_IMAGE_NAME=wikibase-bundle
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
```

For more information on selenium testing see the [README](../../Docker/test/selenium/README.md) file in the selenium folder.
