# Wikibase release pipeline

## Repository overview

The wikibase release pipeline contains scripts used for building, testing and publishing Wikibase docker images and tarballs.

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

# Build only the query service container and save the docker image to a tarball
$ ./build.sh --save-image wdqs

# Build the wdqs-frontend container and extract a standalone tarball from the webroot
$ ./build.sh --extract-tarball wdqs-frontend

# Build the wdqs container without using Dockers cache
$ ./build.sh --no-cache wdqs
```

### Test Commands

```
$ ./test.sh
$ ./test.sh repo
$ ./test.sh repo --spec special-item
$ ./test.sh upgrade WMDE9
```

### Example Instance Commands

```
$ docker compose \
    -f ./example/docker-compose.yml \
    -f ./example/docker-compose.extra.yml \
    --env-file ./example/template.env up
```

## Development Setup

To take advantage of the git hooks we've included, you'll need to configure git to use the `.githooks/` directory.

```
$ git config core.hooksPath .githooks
```

## Documentation

The pipeline documentation can be found [here](docs/index.md).
