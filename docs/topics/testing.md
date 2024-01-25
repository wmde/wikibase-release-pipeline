# Testing

Tests are organized in "suites" which can be found in `test/suites`. Each suite runs a series of specs (tests) found in the `test/specs` directory. Which specs  run in each suite by default are specified in the `.config.ts` file in each suite directory under the `specs` key.

All test suites except `example` and `upgrade` are ran against the most recently built local Docker images, those are the images with the `:latest` tag which are also taken when no tag is specified. The `example` test suite runs against the remote Docker Images specified in the configuration in the `/example` directory. The `upgrade` suite runs the remote Docker images from the specified previous version, and tests upgrading to the latest local build.

You can run the tests in the docker container locally as they are ran in CI using `test.sh`.

## Examples usage of `./test.sh`:

```bash
# See all`./test.sh` CLI options
./test.sh --help

# To run all test suites
./test.sh all

# To only run a single suite (e.g. repo)
./test.sh repo

# To run upgrade tests
# Previous releases Docker Image URLs are defined in `test/suites/upgrade/versions.ts`
./test.sh upgrade WMDE9_BUNDLE

# To only run a specific file within the setup for any test suite (e.g. repo and the babel extension)
./test.sh repo --spec specs/repo/extensions/babel.ts
```

There are also a few special options which are useful when writing tests, or in setting-up and debugging the test runner:

```bash
# '--setup`: starts the test environment for the suite and leaves it running, but does not run any specs
./test.sh repo --setup

# `--command`, `--c`: Runs the given command on the test-runner and doesn't execute any further commands
./test.sh --command npm install

# Sets test timeouts to 1 day so they don't timeout while debugging with `await browser.debug()` calls
# This however can have undesirable effects during normal test runs so only use for actual debugging
# purposes. 
./test.sh repo --debug

# `DEBUG`: Shows full Docker compose up/down progress logs for the Test Runner
# Note that the Test Service Docker logs can always be found in `test/suites/<suite>/results/wdio.log`
DEBUG=true ./test.sh repo
```

WDIO Testrunner CLI options are also supported. See https://webdriver.io/docs/testrunner.

##  Variables for testing some other instance

In order to test your own instances of the services, make sure to set the following environment variables to the services that should be tested:

```bash
WIKIBASE_URL=http://wikibase.svc
WIKIBASE_CLIENT_URL=http://wikibase-client.svc
QUICKSTATEMENTS_URL=http://quickstatements.svc:80
WDQS_FRONTEND_URL=http://wdqs-frontend.svc:80
WDQS_URL=http://wdqs.svc:9999
WDQS_PROXY_URL=http://wdqs-proxy.svc:80
MW_ADMIN_NAME=
MW_ADMIN_PASS=
MW_SCRIPT_PATH=/w
```

For more information on testing see the [README](../../test/README.md).
