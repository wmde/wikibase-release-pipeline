# Wikibase release pipeline

## Repository overview

The wikibase release pipeline contains scripts used for building, testing and publishing Wikibase docker images.

It contains a set of build targets defined in the [Makefile](./Makefile) which can be executed in two different ways.

When [building](docs/topics/pipeline.md), use the [build.sh](build.sh) script.

For [testing](docs/topics/testing.md), you can use `./test.sh <test-suite-name>`, and `./test.sh all`. Type simply `./test.sh` to get help for other CLI options.

## Quick reference

### Build Commands

```
# Build all wikibase suite components docker images
$ ./build.sh

# Build only the mediawiki/wikibase containers
$ ./build.sh wikibase

# Build the wdqs container without using Dockers cache
$ ./build.sh --no-cache wdqs
```

### Test Commands

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

### Example Instance Commands

```
$ docker compose --env-file ./example/template.env up --wait
```

## Development Setup

To take advantage of the git hooks we've included, you'll need to configure git to use the `.githooks/` directory.

```
$ git config core.hooksPath .githooks
```

## Documentation

The pipeline documentation can be found [here](docs/index.md).
