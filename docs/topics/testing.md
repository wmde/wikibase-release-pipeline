# Testing

## Testing Locally

You can run the tests in the docker container locally. Testing locally requires the built images.

```
make test
```

make sure to set the following environment variables to the services that should be tested. 

```
# for testing locally
export MW_SERVER=http://localhost:8585
export QUERYSERVICE_UI_SERVER=localhost:8081
export QUERYSERVICE_SERVER=localhost:8989
export DOCKER_INCLUDE_SETTINGS=
```

For more information on selenium testing see the [README](../../test_scripts/selenium/README.md) file in the selenium folder.
