# The pipeline

## The local.env file

On build a local.env file can be used to override any default settings

#### Use locally installed selenium test dependencies
```
SKIP_INSTALL_SELENIUM_TEST_DEPENDENCIES=1
```
#### Override for branch name of extensions cloned from gerrit
```
GERRIT_EXTENSION_BRANCH_NAME=REL1_35
```
#### Lower the compression rate to make local builds faster
```
GZIP_COMPRESSION_RATE=1
```
#### Log level for selenium tests see wdio.conf.js for options
```
SELENIUM_LOG_LEVEL=trace
```

#### Settings related to tarball publishing
See [publishing](publishing.md).

## The versions folder

The `versions` folder contains .env files with the specific versions of the components to be build for that specific release.

For example, the `wmde1.env` file contains the following variables to tell the pipeline to use the [Wikibase REL1_35] branch and the `mediawiki` image.

```
...
WIKIBASE_BRANCH_NAME=REL1_35
MEDIAWIKI_BRANCH_NAME=REL1_35
...
``` 

## Running the pipeline on github

The build workflow will trigger on pushes to the env file configured as the default version.

```yml
env:
  env_file: ${{ github.event.inputs.env_file || '.env' }}

```

If there is a requirement to build a specific version this can be done by changing the default for the whole pipeline or manually running the pipeline.

To manually run the pipeline go to to actions, click the workflow and run the workflow with the desired `.env` file from the versions folder.

![Queuing the pipeline](../images/queue_job.gif "Queuing the pipeline")


## Building artifacts locally

To build artifacts using docker run the following command which would execute the wikibase pipeline step and produce the artifacts in the `artifacts` folder using the `wmde1.env` environment file. See the [Makefile](../../Makefile) for more build options.

```sh
bash build.sh wikibase versions/wmde1.env
```

[Wikibase REL1_35]: https://gerrit.wikimedia.org/g/mediawiki/extensions/Wikibase/+/refs/heads/REL1_35