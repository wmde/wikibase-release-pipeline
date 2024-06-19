# Wikibase Suite

Wikibase Suite (WBS) is a containerized, production-ready [Wikibase](https://wikiba.se) system that allows you to self-host a knowledge graph similar to [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page).

> 🔧 This document is intended for people involved in developing WBS. If you want to host your own Wikibase instance, head over to the [WBS Deployment Kit documentation](./deploy/README.md). If you're looking for individual WBS Service Images, head over to [hub.docker.com/u/wikibase](https://hub.docker.com/u/wikibase).

## Overview

This repository contains the Wikibase Suite toolset used for: 

 - **Building** ([build.sh](./build.sh) and [build directory](./build))
 - **Testing** ([test.sh](./test.sh) and [test directory](./test))
 - **Publishing** ([.github/workflows](.github/workflows)) 
 - **Deploying** ([WBS Deployment Kit](./deploy))

## Quick reference

### Build

```
# Build all Wikibase suite components, Docker images
$ ./build.sh

# Build only the MediaWiki/Wikibase containers
$ ./build.sh wikibase

# Build the wdqs container without using Docker's cache
$ ./build.sh --no-cache wdqs
```

### Test

```
# Show help for the test CLI, including the various options available. WDIO command line options are also supported (see https://webdriver.io/docs/testrunner/)
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

## Development setup

To take advantage of the git hooks we've included, you'll need to configure git to use the `.githooks/` directory.

```
$ git config core.hooksPath .githooks
```

## Testing

Tests are organized in suites, which can be found in `test/suites`. Each suite runs a series of specs (tests) found in the `test/specs` directory. Which specs run in each suite by default are specified in the `.config.ts` file in each suite directory under the `specs` key.

All test suites are run against the most recently built local Docker images, those with the `:latest` tag, which are also selected when no tag is specified. The `deploy` test suite runs against the remote Docker images specified in the configuration in the `./deploy` directory.

You can run the tests in the docker container locally exactly as they are run in CI by using `test.sh`.

## Examples usage of `./test.sh`:

```bash
# See all`./test.sh` CLI options
./test.sh --help

# Run all test suites
./test.sh all

# Only run a single suite (e.g. repo)
./test.sh repo

# Only run a specific file within the setup for any test suite (e.g., repo and the babel extension)
./test.sh repo --spec specs/repo/extensions/babel.ts
```

There are also a few special options, useful when writing tests or in setting up and debugging the test runner:

```bash
# '--setup`: starts the test environment for the suite and leaves it running, but does not run any specs
./test.sh repo --setup

# `--command`, `--c`: Runs the given command on the test runner and doesn't execute any further commands
./test.sh --command npm install

# Sets test timeouts to 1 day so they don't time out while debugging with `await browser.debug()` calls
# However, this can have undesirable effects during normal test runs, so only use for actual debugging
# purposes.
./test.sh repo --debug

# `DEBUG`: Shows full Docker compose up/down progress logs for the test runner
# Note that the test service Docker logs can always be found in `test/suites/<suite>/results/wdio.log`
DEBUG=true ./test.sh repo
```

WDIO test runner CLI options are also supported. See https://webdriver.io/docs/testrunner .

## Variables for testing some other instance

In order to test your own instances of the services, make sure to change the following environment variables to point at the services that should be tested:

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

For more information on testing, see the [README](./test/README.md).


## Release process

WBS Deployment Kit and WBS Service Images are released using this repository. The process involves defining all upstream component versions to be used, building service images, testing all the images together and finally publishing them.

### Release checklist Phabricator template

```
[ ] **Pending issues as subtasks**. If any open tickets need to be resolved and/or related changes need to be included in the release, add them as subtasks of this release ticket. (If this release was triggered by a MediaWiki bugfix release, consider only including bug/security issue fixes, and avoid breaking changes.)

[ ] **Create branches**

- **For bugfix releases**
  - **Create a release preparation branch.** The release branch itself should already exist, e.g., `mw-1.40`. Create a release preparation branch off the existing release branch. Choose a name for the release prep branch like `releaseprep-1.40.2`. (Don't name it `mw-*`! That's the naming convention for release branches.)
  - **Backport changes from main only if absolutely necessary.** Bugfix releases should contain as few changes as possible. Make sure that the `variables.env` file is not changed by incoming changes from main.
- **For major releases**
  - **Create a new release branch off main,** e.g., `mw-1.44`. This branch is now equivalent to main. It will hold all bugfix releases for that major version in the future.
  - **Create a release preparation branch off that release branch.** e.g., `releaseprep-1.44.0`. This second branch is meant for preparing the first release on that release branch.

[ ] **Update `variables.env`** on the release preparation branch. You can find further instructions in the [variables.env](https://github.com/wmde/wikibase-release-pipeline/blob/main/variables.env) file itself.

[ ] **Update `CHANGES.md`** on the release preparation branch. Add a section following the example of previous releases: update the different values. The spec will eventually point to the release tag's `variables.env` once the release is published.

[ ] **Create a release PR** that merges the release preparation branch, e.g., `releaseprep-1.44.0`, into the corresponding release branch (`mw-1.44` or equivalent).

[ ] **CI should be green**. Tests may need adjustments in order to pass for the new version. Bugfix releases are likely to pass without any adjustments.

[ ] **Do a sanity check by manually reviewing a running instance**. This can be done locally on your machine or by [deploying](https://docs.google.com/document/d/1BGxcqt9CHbb-8dfWjK-lZmNoNcD08urb23JqtgoVTeg/edit#heading=h.6a8ctlepqn5d) to the [test system](https://wikibase-product-testing.wmcloud.org). You can find prebuilt images from your PR on the [GitHub Container Registry](https://github.com/wmde/wikibase-release-pipeline/pkgs/container/wikibase%2Fwikibase) tagged with `dev-BRANCHNAME`, e.g., `dev-releaseprep-wmde.17`. This tag can be referenced to set up an instance running your PR version.

[ ] **Get two reviews on the release preparation PR** so that it is technically ready to be merged. Merging will eventually trigger the release to Docker Hub.

[ ] **Prepare communication** by creating a [release announcement](https://drive.google.com/drive/folders/1kHhKKwHlwq_P9x4j8-UnzV72yq0AYpsZ) using a template.

[ ] **Coordinate with ComCom on timing the publication of the release**. Talk to SCoT (ComCom, technical writer) about this.

[ ] **Publish the release** by merging the release preparation branch into the release branch. **ATTENTION: This will automatically push images to Docker Hub, thereby releasng the new version!**

[ ] **Update the [Docker install instructions](https://github.com/wmde/wikibase-release-pipeline/blob/main/deploy/README.md)** to reflect changes in the latest version. If you were making a bugfix release for an older release, this can be skipped.

[ ] **Make sure the communication is sent.**

[ ] **Update the deploy directory.** ☠️☠️☠️ Currently, for this to happen, we need to merge another PR to the release branch. This PR's only change should be making the `deploy` directory reference the new version. For this PR's pipeline to properly run, before merging, you need to manually delete from the git repo the tag of the version you just released. Merging this deploy directory update PR is technically a re-release. Hopefully this weirdness will be fixed soon.

[ ] **Merge back to main**. Now is the time to merge anything you want back to main on the release branch.

You`re done. **Congratulations!**
```
