# Wikibase release pipeline

## Repository overview

The wikibase release pipeline contains scripts used for building, testing and publishing Wikibase docker images and tarballs.

It contains a set of build targets defined in the [Makefile](./Makefile) which can be executed in two different ways.

When [building](docs/topics/pipeline.md), use the [build.sh](build.sh) wrapper script to do the building inside a docker-container, this way files aren't littered around the repository but only in the `artifacts/` directory.

For [testing](docs/topics/testing.md), you can use `test`, `test-all` make targets.

## Quick reference

### Build Commands

```
$ ./build.sh all
$ ./build.sh wikibase
```

### Test Commands

```
$ ./test.sh
$ ./test.sh repo
$ ./test.sh repo special-item
$ make test-upgrade VERSION=wmde.9
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
