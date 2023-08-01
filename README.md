# Wikibase release pipeline

## Repository overview

The wikibase release pipeline contains scripts used for building, testing and publishing Wikibase docker images and tarballs.

It contains a set of build targets defined in the [Makefile](./Makefile) which can be executed in two different ways.

When [building](docs/topics/pipeline.md), use the [build.sh](build.sh) wrapper script to do the building inside a docker-container, this way files aren't littered around the repository but only in the `artifacts/` directory.

For [testing](docs/topics/testing.md), you can use `test`, `test-all` make targets.

## Quick reference

### Build Commands

```
$ ./build.sh all versions/wmde11.env
$ ./build.sh wikibase_bundle versions/wmde12.env
```

### Test Commands

```
$ make test-all
$ make test SUITE=repo
$ make test SUITE=repo FILTER=special-item
$ make test-upgrade VERSION=wmde.9 TO_VERSION=versions/wmde12.env
```

### Example Instance Commands

```
$ docker compose \
    -f ./example/docker-compose.yml \
    -f ./example/docker-compose.extra.yml \
    --env-file ./example/template.env up
```

## Documentation

The pipeline documentation can be found [here](docs/index.md).
