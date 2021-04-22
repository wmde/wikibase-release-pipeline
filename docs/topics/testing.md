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

## Test upgrading between images

Tests upgrading between a previous release defined in `test/upgrade/old-versions/` and the newly built version. Runs the `upgrade` suite.

```
make test-upgrade VERSION=wmde.0
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
