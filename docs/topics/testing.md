# Testing


## Testing Locally

You can run the tests in the docker container locally. Testing locally requires the built images.

To run all
```
make test-all
```

To only run a single suite

```
make test SUITE=repo
```

In order to test your own instances of the services, make sure to set the following environment variables to the services that should be tested. 


To only run a specific file in the repo tests

```
make test SUITE=repo FILTER=babel*
```

```
# for testing locally
export MW_SERVER=http://localhost:8585
export QUERYSERVICE_UI_SERVER=localhost:8081
export QUERYSERVICE_SERVER=localhost:8989
```

For more information on selenium testing see the [README](../../Docker/test/selenium/README.md) file in the selenium folder.
