# The pipeline

## Github Actions Workflows

At it's core this repository is just a set of make targets that gets orchestrated by Github Actions workflows. We currently have the following workflows.

#### [.Github/workflows/build_and_test.yml](.github/workflows/build_and_test.yml)
This is the main workflow that builds Wikibase and related software, tests it and then produces release candidate artifacts that can be used for further acceptance testing and publishing.

#### [.Github/workflows/publish.yml](.github/workflows/publish.yml)

This workflow is used to publish the artifacts of a workflow from Github.

## Running the pipeline on Github

The build workflow will trigger on pushes on `main` and PRs.

If there is a requirement to build a specific version this can be done by reverting to a certain git commit.

## Artifacts on Github

After triggering the pipeline a set of jobs will start running, which after a successful run will result in a number of artifacts as described in the diagram below.

![Queuing the pipeline](../diagrams/output/overview.svg "Queuing the pipeline")

`DockerImages` - contains the release candidate docker images for each component that was built.

`TestResults` - contains logs and screenshots from testing.

`ScanResults` - contains logs from vulnerability testing.


## Running the pipeline locally

To execute the entire build pipeline, just run `build.sh`.

```sh
./build.sh
```

To build single artifacts locally, you can issue the following command.

```sh
./build.sh wikibase
```

To rebuild without using Dockers cache, add the `--no-cache` option. Note that this will extend build times as all components need to be downloaded again (except Docker base images).

```sh
$ ./build.sh --no-cache
```


### Clean local artifacts

To remove any locally produced artifacts you can run the following commands.

```sh
./clean.sh
```

### Downloaded artifacts

Any downloaded artifacts from workflow runs on Github actions will be saved as a folder under `artifacts/<WORKFLOW_ID>` and are exempt from any cleaning commands.

For more info on downloading artifacts from Github see [publishing](publishing.md).

[Wikibase REL1_35]: https://gerrit.wikimedia.org/g/mediawiki/extensions/Wikibase/+/refs/heads/REL1_35

## The local.env file

On build a local.env file can be used to override any default settings

#### Override for branch name of extensions cloned from gerrit
```
GERRIT_EXTENSION_BRANCH_NAME=REL1_35
```
#### Lower the compression rate to make local builds faster
```
GZIP_COMPRESSION_RATE=1
```
#### Log level for selenium tests see wdio.conf.ts for options
```
TEST_LOG_LEVEL=trace
```
#### Timeout for mocha tests (in milliseconds)
```
MOCHA_OPTS_TIMEOUT=90000
```
#### Timeout for waitFor* calls in tests (in milliseconds)
```
WAIT_FOR_TIMEOUT=30000
```
