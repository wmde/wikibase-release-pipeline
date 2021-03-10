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

## The versions folder

The `versions` folder contains .env files with the specific versions of the components to be build for that specific release.

For example, the `REL1_35.env` file contains the following variables to tell the pipeline to use the [Wikibase REL1_35] branch and the `mediawiki` image.

```
...
WIKIBASE_BRANCH_NAME=REL1_35
MEDIAWIKI_IMAGE_NAME=mediawiki
...
``` 

## Running the pipeline on github

The workflow will trigger periodically and on pushes to this repository using the [.env](../../.env) file which should be set to build against the master branch of Wikibase and related components.

If there is a requirement to build a specific configuration this can be done by going to actions, clicking the workflow and run the workflow with the desired env file.

![Queuing the pipeline](../images/queue_job.gif "Queuing the pipeline")

## List all artifacts on Github

The github pipeline produces new artifacts on each run and they can all be viewed by using the [github API](https://api.github.com/repos/wmde/wikibase-release-prototype/actions/artifacts). 


## Building artifacts locally

To build artifacts using docker run the following command which would execute the wikibase pipeline step and produce the artifacts in the `artifacts` folder using the `REL1_35.env` environment file. See the [Makefile](../../Makefile) for more build options.

```sh
bash build.sh wikibase versions/REL1_35.env
```

[Wikibase REL1_35]: https://gerrit.wikimedia.org/g/mediawiki/extensions/Wikibase/+/refs/heads/REL1_35