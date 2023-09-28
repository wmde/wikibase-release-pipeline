# Wikibase release pipeline

## Repository overview

The wikibase release pipeline contains scripts used for building, testing and publishing Wikibase docker images and tarballs.

It contains a set of build targets defined in the [Makefile](./Makefile) which can be executed in two different ways.

When [building](docs/topics/pipeline.md), use the [build.sh](build.sh) wrapper script to do the building inside a docker-container, this way files aren't littered around the repository but only in the `artifacts/` directory.

For [testing](docs/topics/testing.md), you can use `test`, `test-all` make targets.

## Quick reference

### Build Commands

```
# ./build.sh COMPONENT CHANNEL
$ ./build.sh all stable
$ ./build.sh wikibase_bundle lts
```

### Test Commands

```
$ make test
$ make test CHANNEL=next
$ make test SUITE=repo
$ make test SUITE=repo FILTER=special-item
$ make test SUITE=repo CHANNEL=lts
$ make test-upgrade VERSION=wmde.9 TO_VERSION=versions/wmde12.env
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
