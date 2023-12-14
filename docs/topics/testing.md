# Testing


## Testing Locally

You can run the tests in the docker container locally. Testing locally requires the built images.

## To run all
```
./test.sh
```

## To only run a single suite
```
./test.sh repo
```

In order to test your own instances of the services, make sure to set the following environment variables to the services that should be tested. 


## To only run a specific file in the repo tests
```
./test.sh repo --spec babel*
```

## Test upgrading between base/bundle images

Tests upgrading between a previous release defined in `test/suites/upgrade/versions.ts` and the newly built base version. Runs the `upgrade` suite.

```
./test.sh upgrade WMDE0
```
or
```
./test.sh upgrade WMDE0_BUNDLE
```

## Test the example

Tests the example configuration by running the `example` test suite.

```
./test.sh example
```

##  Variables for testing some other instance
```
WIKIBASE_URL=http://wikibase.svc
WIKIBASE_CLIENT_URL=http://wikibase-client.svc
QUICKSTATEMENTS_URL=http://quickstatements.svc:80
WDQS_FRONTEND_URL=http://wdqs-frontend.svc:80
WDQS_URL=http://wdqs.svc:9999
PINGBACK_BEACON_SERVER=http://mediawiki.svc
WDQS_PROXY_URL=http://wdqs-proxy.svc:80
MW_ADMIN_NAME=
MW_ADMIN_PASS=
MW_SCRIPT_PATH=/w
```

## Variables for running the a specific test file against a wikibase.cloud/localhost instance

Create a `test/wbaas.minikube.repo.env` file with the following contents

```
WIKIBASE_URL=http://minikube.wbaas.localhost

MW_ADMIN_NAME=Minikube
MW_ADMIN_PASS=superpassword

MW_SCRIPT_PATH=/w

FILTER=api.ts
MOCHA_OPTS_TIMEOUT=3600000000
```

Source the file on each run and execute the `test:run-filter` target on the selenium package in `test`.

```bash
set -o allexport; source wbaas.minikube.repo.env; set +o allexport && npm run test:run-filter
```

For more information on selenium testing see the [README](../../test/selenium/README.md) file in the selenium folder.
