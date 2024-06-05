# Wikibase Suite

Wikibase Suite (WBS) is a containerised, production ready [Wikibase](https://wikiba.se) system, that allows you to self host a knowledge graph similar to [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page.

> 🔧 This document is for people developing WBS. If you want to host your own Wikibase instance, head over to the [WBS Deployment Kit documentation](./deploy/README.md). If you are looking for individual WBS Service Images, head over to [hub.docker.com/u/wikibase](https://hub.docker.com/u/wikibase).

## Overview

This repository contains Wikibase Suite tools used for 

 - **Building** ([build.sh](./build.sh) and [build directory](./build))
 - **Testing** ([test.sh](./test.sh) and [test directory](./test))
 - **Publishing** ([.github/workflows](.github/workflows)) 
 - **Deploying** ([WBS Deployment Kit](./deploy))

## Quick reference

### Build

```
# Build all wikibase suite components docker images
$ ./build.sh

# Build only the mediawiki/wikibase containers
$ ./build.sh wikibase

# Build the wdqs container without using Dockers cache
$ ./build.sh --no-cache wdqs
```

### Test

```
# Show help for the Test CLI, including various options available. WDIO command line options are also supported (see https://webdriver.io/docs/testrunner/)
$ ./test.sh

# Runs all test suites (defined in `test/suites`)
$ ./test.sh all

# Runs the `repo` test suite
$ ./test.sh repo

# Runs the `repo` test suite with a specific spec file (paths to spec files are rooted in the `test` directory)
$ ./test.sh repo --spec specs/repo/special-item.ts

# Start and leave up the test environment for a given test suite without running tests
$ ./test.sh repo --setup
```

### Deploy

```
$ cd deploy
$ docker compose up --wait
```

## Development Setup

To take advantage of the git hooks we've included, you'll need to configure git to use the `.githooks/` directory.

```
$ git config core.hooksPath .githooks
```

## Testing

Tests are organized in "suites" which can be found in `test/suites`. Each suite runs a series of specs (tests) found in the `test/specs` directory. Which specs run in each suite by default are specified in the `.config.ts` file in each suite directory under the `specs` key.

All test suites are ran against the most recently built local Docker images, those are the images with the `:latest` tag which are also taken when no tag is specified. The `deploy` test suite runs against the remote Docker Images specified in the configuration in the `./deploy` directory.

You can run the tests in the docker container locally as they are ran in CI using `test.sh`.

## Examples usage of `./test.sh`:

```bash
# See all`./test.sh` CLI options
./test.sh --help

# To run all test suites
./test.sh all

# To only run a single suite (e.g. repo)
./test.sh repo

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

## Variables for testing some other instance

In order to test your own instances of the services, make sure to set the following environment variables to the services that should be tested:

```bash
WIKIBASE_URL=http://wikibase
WIKIBASE_CLIENT_URL=http://wikibase-client
QUICKSTATEMENTS_URL=http://quickstatements
WDQS_FRONTEND_URL=http://wdqs-frontend
WDQS_URL=http://wdqs:9999
WDQS_PROXY_URL=http://wdqs-proxy
MW_ADMIN_NAME=
MW_ADMIN_PASS=
MW_SCRIPT_PATH=/w
```

For more information on testing see the [README](./test/README.md).


## Release Process

Wikibase and related software gets release through this repository. The process for releasing involves defining the release in this repository, testing all the components of the release together and finally publishing them.

### Release Checklist Phabricator Template

```
[ ] **Pending issues as subtasks**. If any open tickets need to be resolved and related changes need to be included in the release, add them as subtasks of this release ticket. (If this release is triggered by a Mediawiki bugfix release, consider only including bug/security issue fixes and avoid breaking changes.)

[ ] **Create branches**

- **For bugfix releases**
  - **Create a release preparation branch.** The release branch already exists. E.g. `mw-1.40`. Create a release preparation branch off of the existing release branch. E.g. `releaseprep-1.40.2` off of `mw-1.40`. Do not name it `mw-*` as this is the reserved naming scheme for our release branches.
  - **Backport changes from main if really needed.** Bugfix releases should contain as little changes as possible. Make sure that the `variables.env` file is not changed by incoming changes from main.
- **For major releases**
  - **Create a new release branch off of main.** E.g. `mw-1.44`. This branch is now equal to main. It will hold all bugfix releases for that major version in the future.
  - **Create a release preparation branch off of that release branch.** E.g. `releaseprep-1.44.0`. This second branch is meant to prepare the first release on that release branch.

[ ] **Update `variables.env`** on the release preparation branch. Find further instruction in the [variables.env](https://github.com/wmde/wikibase-release-pipeline/blob/main/variables.env) file itself.

[ ] **Update `CHANGES.md`** on the release preparation branch. Add a section following the example of previous releases, update the different values. The spec will eventually point to the release tags variables.env once the release is published.

[ ] **Create a release PR** that merges the release preparation branch e.g. `releaseprep-1.44.0` into release branch e.g. `mw-1.44`.

[ ] **CI should be green**. Tests may need adjustments in order to pass for the new version. Bugfix releases are likely to pass without any adjustments.

[ ] **Do a sanity check by manually reviewing a running instance**. This could be done locally on your machine or by [deploying](https://docs.google.com/document/d/1BGxcqt9CHbb-8dfWjK-lZmNoNcD08urb23JqtgoVTeg/edit#heading=h.6a8ctlepqn5d) it to the [test system](https://wikibase-product-testing.wmcloud.org). You find built images from your PR on GHCR (e.g. [here](https://github.com/wmde/wikibase-release-pipeline/pkgs/container/wikibase%2Fwikibase)) tagged with `dev-BRANCHNAME`, e.g. `dev-releaseprep-wmde.17`. This tag can be referenced in example to setup an instance running your PR version.

[ ] **Get two reviews on the release preparation PR**. So that it is technically ready to be merged. The merge will trigger the release to dockerhub later.

[ ] **Prepare communication** by creating a [release announcement](https://drive.google.com/drive/folders/1kHhKKwHlwq_P9x4j8-UnzV72yq0AYpsZ) based on existing one.

[ ] **Agree with ComCom on a timing to publish the release**. Talk to ComCom and TechWriter about that.

[ ] **Publish the release** by merging the release preparation branch into the release branch. ‼️ ‼️ ‼️ **This will automatically push docker images to docker hub and therefore release the new version!**

[ ] **Update the [docker install instructions](https://www.mediawiki.org/wiki/Wikibase/Docker)** to reflect the latest version. If you made a bugfix release for an older release, this can be skipped.

[ ] **Make sure the communication is sent.**

[ ] **Update the deploy directory** ☠️☠️☠️ For this to happen, we currently need to merge another PR to the release branch. This PRs only change should be making the deploy directory reference the new version. For this PRs pipeline to properly run, you need to manually delete the git tag of your just released version from the github repo before merging. Merging this deploy directory update PR is technically a re-release. This weirdness will hopefully be fixed soon.

[ ] **Merge back to main**. Decide whether there is stuff you want to merge back to main on the release branch.

You are done. **Congratulations!**
```
