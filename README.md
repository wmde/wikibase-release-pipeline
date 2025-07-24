# Wikibase Suite

Wikibase Suite (WBS) eases self-hosting [Wikibase](https://wikiba.se) in production, allowing you to maintain a knowledge graph similar to [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page).

If you want to host your own WBS instance, head over to the [WBS Deploy documentation](./deploy/README.md).

If you're looking for individual WBS images, head over to [hub.docker.com/u/wikibase](https://hub.docker.com/u/wikibase).

> 🔧 This document is intended for people developing WBS.

## Overview

This repository contains the Wikibase Suite toolset used for [building](./build), [testing](./test), and [publishing ](.github/workflows) WBS Images and [WBS Deploy](./deploy).

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
WDQS_URL=http://query
MW_ADMIN_NAME=
MW_ADMIN_PASS=
MW_SCRIPT_PATH=/w
```

For more information on testing, see the [README](./test/README.md).

## Release and Publish Process

WBS Deploy and WBS Images are released and published using this repository. 

Major releases and those containing significant changes are announced to the community.

### Changes to be Released

Different kinds of changes can make a release desirable. All of them should be reviewed and merged to the `main` branch in order to be part of a release.

#### Upstream Version Bumps

Changing the version of an upstream component can trigger a version bump on our side. Depending on the change, this may lead to a major, minor, or patch version following [Semantic Versioning](https://semver.org/). Upstream versions are changed in the `build/*/build.env` files. Some of our images support updating some of the version references automatically using `./nx run wikibase:update-commits`, `./nx run quickstatements:update-commits`, and `./nx run wdqs-frontend:update-commits`.

MediaWiki Minor versions, that is moving from 1.41 to 1.42, are a special case. They always lead to a major version bump in Wikibase Image.

#### Local Changes

Changes to our products implemented locally also lead to version bumps. Depending on the change, this may lead to a major, minor, or patch version following [Semantic Versioning](https://semver.org/).

### Building and Testing

Changes need to be built and tested. This is done by CI as implemented in `./github/workflows/` and automatically triggered in every PR and every commit on `main`.

Alternatively, to run build and test locally, do:
```sh
git checkout main
git pull
./nx run-many -t build -p "build/**"
./nx test -- all --headed
```

### Preparing a Release

Preparing a release involves verifying the version number and changelog files generated. This can be done on CI using the [Create a WBS Release Action](https://github.com/wmde/wikibase-release-pipeline/actions/workflows/create_release.yml). This is basically always done for the `main` branch. This contains reviewed changed that are releasable. Choose "Dry run, don't do it yet" to generate versions and changelogs without saving it. On the `release` job, there is a step called `Create release`. Its logs will show you what changelogs would be generated as well as which version bumps were inferred.

The same thing can be done locally. This can come in handy for testing and is often faster.

To do a release dry-run (nothing but informative output will happen) for all projects with unreleased changes:
```bash
git checkout main
git pull
./nx release --dry-run
```

### Preparing the Announcement
Major releases and those containing significant changes are announced to the community. Plan with the Developer Advocate. Sync specifically on timing as the announcement should go out shortly after the actual publish. Ideally within a couple of hours.


### Releasing and Publishing
Doing a release involves generating the version number bump and changelog files. 

Publishing Images involves pushing them to DockerHub. 

Publishing Deploy is currently just done by pushing a new git tag to our repository.

#### Releasing and Publishing using CI

 This can be done on CI using the [Create a WBS Release Action](https://github.com/wmde/wikibase-release-pipeline/actions/workflows/create_release.yml). Releases are basically always done from the `main` branch. Disable "Dry run, don't do it yet" to actually do a release. This will change version numbers in `package.json` files, update changelog files, and `git tag` these new versions.

This changes will be then automatically pushed back into the repository. Pushing the new tags (such as `wikibase@1.2.3`) will trigger another CI action that publishes new images on DockerHub.

#### Releasing and Publishing locally

Releasing can also be done (semi-)locally. To do a release of a single project do:
```sh
git checkout main
git pull
./nx release -p wikibase
```

Running locally also allows you to modify the resulting version number manually as well as to customize the changelog file. Use `./nx release --help` to learn more about that.

When you are done, you can publish the release by pushing the tag to Github. For images, this will trigger a Github Actions to publish on DockerHub.
```
git push --tags origin wikibase@1.2.3
```

Pushing `deploy@X.Y.Z` tags does not trigger any further actions.


You`re done. **Congratulations!**
