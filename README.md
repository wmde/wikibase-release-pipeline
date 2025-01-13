# Wikibase Suite

Wikibase Suite (WBS) eases self-hosting [Wikibase](https://wikiba.se) in production, allowing you to maintain a knowledge graph similar to [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page).

If you want to host your own WBS instance, head over to the [WBS Deploy documentation](./deploy/README.md).

If you're looking for individual WBS images, head over to [hub.docker.com/u/wikibase](https://hub.docker.com/u/wikibase).

> 🔧 This document is intended for people developing WBS.

## Overview

This repository contains the Wikibase Suite toolset used for [building](./build)), testing, and publishing ([.github/workflows](.github/workflows)) WBS Images and WBS Deploy ([WBS Deploy](./deploy)).

## Quick reference

### Build

```
# Build all Wikibase Suite images
$ ./nx run-many -t build -p "build/**"

# Build only the MediaWiki/Wikibase containers
$ ./nx build wikibase

# Build the WDQS container without using Docker's cache (accepts `docker buildx bake` options)
$ ./nx build wdqs --no-cache

# Update upstream commit hashes for wikibase
$ ./nx run wikibase:update-commits

# Update upstream commit hashes for all images
$ ./nx run-many -t update-commits
```

### Test

```
# Show help for the test CLI, including the various options available. WDIO command line options are also supported (see https://webdriver.io/docs/testrunner/)
$ ./nx test

# Runs all test suites (defined in `test/suites`)
$ ./nx test -- all

# Runs the `repo` test suite
$ ./nx test -- repo

# Runs the `repo` test suite with a specific spec file (paths to spec files are rooted in the `test` directory)
$ ./nx test -- repo --spec specs/repo/special-item.ts

# Start with a headed browser
$ ./nx test -- repo --headed

# Start a specific spec only
./nx test -- repo --spec specs/repo/queryservice.ts

# Start and leave up the test environment for a given test suite without running tests
$ ./nx test -- repo --setup
```

### Deploy

```
$ cd deploy
$ docker compose up --wait
```

Find more details in the [WBS Deploy documentation](./deploy/README.md).

## Development setup

To take advantage of the git hooks we've included, you'll need to configure git to use the `.githooks/` directory.

```
$ git config core.hooksPath .githooks
```

## Testing

Tests are organized in suites, which can be found in `test/suites`. Each suite runs a series of specs (tests) found in the `test/specs` directory. Which specs run by default in each suite are specified in the `.config.ts` file in each suite directory under the `specs` key.

All test suites are run against the most recently built local Docker images, those with the `:latest` tag, which are also selected when no tag is specified. The `deploy` test suite runs against the remote Docker images specified in the configuration in the `./deploy` directory.

You can run the tests in the Docker container locally exactly as they are run in CI by using `./nx test`.

## Examples usage of `./nx test`:

```bash
# See all`./nx test` CLI options
./nx test --help

# Run all test suites
./nx test -- all

# Only run a single suite (e.g., repo)
./nx test -- repo

# Only run a specific file within the setup for any test suite (e.g., repo and the Babel extension)
./nx test -- repo --spec specs/repo/extensions/babel.ts
```

There are also a few special options, useful when writing tests or in setting up and debugging the test runner:

```bash
# '--setup`: starts the test environment for the suite and leaves it running, but does not run any specs
./nx test -- repo --setup

# Sets test timeouts to 1 day so they don't time out while debugging with `await browser.debug()` calls
# However, this can have undesirable effects during normal test runs, so only use for actual debugging
# purposes.
./nx test -- repo --debug
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

WBS Deploy and WBS images are released using this repository. The process
involves updating upstream component versions to be used, building images,
testing all the images together and finally publishing them.

### Release checklist Phabricator template

```
- [ ] **Pending issues as subtasks**. If any open tickets need to be resolved and/or related changes need to be included in the release, add them as subtasks of this release ticket.
  - [ ] **Update `build/*/build.env`** bump upstream versions by changing `build.env` files. You can find further instructions in the `build.env` files themselves.
- [ ] **Merge all pending changes to `main`** releases are always done from the `main` branch.
- [ ] **Verify CI on `main` is green**
- [ ] **Do a sanity check by manually reviewing a running instance using your build**. This can be done locally on your machine or on a public server. You can find built images from your release preparation branch on the [GitHub Container Registry](https://github.com/wmde/wikibase-release-pipeline/pkgs/container/wikibase%2Fwikibase) tagged with `dev-GITHUB_ACTIONS_RUN_NUMBER`, e.g., `dev-123456789`. This tag can be used to set up an instance running your release preparation version.
- [ ] **Release Dry Run** by running the Github Action [Create a WBS Release](https://github.com/wmde/wikibase-release-pipeline/actions/workflows/create_release.yml) in Dry Run mode. Check the output and review version and changelog generated.
- [ ] **Prepare communication** by creating a [release announcement](https://drive.google.com/drive/folders/1iZMbdXGPsG0pLs-_HrniT5ac28aw1Edu).
- [ ] **Coordinate with ComCom on timing the publication of the release**. Talk to SCoT (ComCom, technical writer) about this.
- [ ] **Publish the release** by running the Github Action [Create a WBS Release](https://github.com/wmde/wikibase-release-pipeline/actions/workflows/create_release.yml) **ATTENTION: This will automatically push images to Docker Hub!**
- [ ] **Update Dockerhub README** (from `./build/*/dockerhub.md`) if required (e.g. major versions changed).

You`re done. **Congratulations!**
```
