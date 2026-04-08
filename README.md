# Wikibase Suite

Wikibase Suite (WBS) is a software stack that eases self-hosting [Wikibase](https://wikiba.se) in production, allowing you to maintain a knowledge graph similar to [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). You can customize it as per your requirements and be a part of the Linked Open Data initiative!

If you want to host your own WBS instance, here are some helpful links:

- [Installation Guide and Maintenance](./deploy/README.md)
- [Individual WBS images](https://hub.docker.com/u/wikibase)
- [Our Website](https://wikiba.se/)
- [Telegram Community Channel for Wikibase Suite](https://t.me/wikibasesuite)
- [Telegram Community Channel for Wikibase](https://t.me/+WBsf9-C9KPuMZCDT)
- [Our Phabricator Board for what we are currently working on](https://phabricator.wikimedia.org/project/board/5755/)
- [Mastodon for Wikibase](https://wikis.world/@Wikibase)
- [Wikibase Suite Team Mail](wikibase-suite@wikimedia.de)
- [Our mailing list](https://lists.wikimedia.org/postorius/lists/wikibaseug.lists.wikimedia.org/?source=post_page---------------------------)

> 🔧 This document is intended for people developing WBS.

## Overview

This repository contains the Wikibase Suite toolset used for [building](./build), [testing](./test), and [publishing ](.github/workflows) WBS Images and [WBS Deploy](./deploy).

## Quick reference

### Build

```
# Build all Wikibase Suite images
$ ./nx build

# Build only the MediaWiki/Wikibase containers
$ ./nx build wikibase

# Build the WDQS container without using Docker's cache (accepts `docker buildx bake` options)
$ ./nx build wdqs --no-cache

# Update upstream commit hashes for wikibase
$ ./nx run wikibase:update-commits

# Update upstream commit hashes for all images
$ ./nx update-commits
```

### Test

```
# Show help for the test CLI, including the various options available. WDIO command line options are also supported (see https://webdriver.io/docs/testrunner/)
$ ./nx test -- --help

# Runs all test suites (defined in `test/suites`)
$ ./nx test

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

_⚠️ Note: Builds are currently not performed automatically by tests. Make sure you have built against current changes before running tests. See [Build](#build) above._

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

## 🚚 Release and Publish Process

### 📄 Overview

Releasing WBS has three stages: prepare, review, and publish. In preparation, we branch from freshly updated `main`, move to the target MediaWiki version, refresh related upstream component versions, and run a local build/test loop until the update set is stable. We then derive WBS version bumps and changelog drafts from commit history, refine that output into final release notes, and open a release PR for team review. After approval and merge, publishing is coordinated with the Developer Advocate so announcement timing and release timing line up, then `Create Release` is run on `main` to create/push tags and trigger DockerHub image publishing.

### ✅ Release Flow

1. Prepare the release implementation changes (substantive release work):
   - create a release branch from a freshly updated `main`
     ```bash
     git checkout main
     git pull
     git checkout -b <release-branch-name>
     ```
   - update `MEDIAWIKI_VERSION` in `build/wikibase/build.env` to the target MediaWiki version
   - run `./nx update-commits` to refresh upstream commit pins across the build images (including Wikibase, WDQS, WDQS frontend, and QuickStatements) for the selected MediaWiki line:
     ```bash
     ./nx update-commits
     ```
   - build and test locally:
     ```bash
     ./nx build
     ./nx test
     ```
   - fix any breakages caused by the MediaWiki bump or dependency updates, then repeat build/test until green

2. Derive target versions locally:
   ```bash
   ./nx release version
   ```

3. Derive and refine changelog entries for each changed project:
   ```bash
   ./nx release changelog <version-from-package-json> -p <project-name> --git-commit=false --git-tag=false
   ```
   Generated changelog entries are a starting draft. Review and refine them so they accurately reflect the changes since the last release, and are useful for consolidation into release announcements.

4. Update `DEPLOY_VERSION` in `deploy/docker-compose.yml` to exactly match the version specified in `deploy/package.json`. *As a safeguard CI fails on the version reporting test if there is any divergence.*

5. Once the version/changelog changes are finalized, push the release branch to Github and open a new PR with target branch of `main`. Once the CI tests pass on that PR, tag the "wikibase-suite" team as reviewers.

6. Once PR is reviewed and approved, merge to `main`.

7. All releases should be announced to the community before finalized, coordinate timing with the Developer Advocate BEFORE completing Step 8 below so the announcement follows the publish closely.

8. Run `Create Release` on `main`:
   - run [Create a WBS Release Action](https://github.com/wmde/wikibase-release-pipeline/actions/workflows/create_release.yml) after the release PR has been finalized, reviewed, approved, and merged
   - `dry_run=true` to audit tags only.
   - `dry_run=false` to create and push missing tags.
   - workflow behavior:
     - derives tags from committed `package.json` values (`<name>@<version>`)
     - creates only tags that do not already exist on `origin`
     - pushes tags one by one so each tag emits its own push event
   - does not run `nx release`, infer/rewrite versions, or generate changelogs
   - publishing behavior:
     - image tags (for example `wikibase@1.2.3`) trigger DockerHub publish workflows
     - `deploy@X.Y.Z` tags do not trigger DockerHub image publishing
