

# Publishing a successful build

## Checklist for releasing

- [ ] Download and verify release artifacts
- [ ] Publish to dockerhub
- [ ] Publish to releases.wikimedia.org
- [ ] Publish git tags
- [ ] Announce the release

## Prerequisutes

- Add `GITHUB_TOKEN` to your `local.env` file with the `repo` and `workflow` scopes selected from [here](https://github.com/settings/tokens). 
- Add `DOCKER_HUB_ID`  to your `local.env` file with your docker hub username.
- Add `DOCKER_HUB_ACCESS_TOKEN` to your `local.env` file with your docker hub api key from [here](https://hub.docker.com/settings/security)
- Add `RELEASE_HOST` to your `local.env` file pointing to the releases server for tars, e.g. `releases1002.eqiad.wmnet`

So your local.env file could look like this:
```
GITHUB_TOKEN=ghp_KsOtthisisnotavalidtokenoXcafeaffeR4
DOCKER_HUB_ID=dockerhubuser
DOCKER_HUB_ACCESS_TOKEN=dckr_pat_tHisAlsoX_PisNOTaValidToken
RELEASE_HOST=releases1002.eqiad.wmnet

WORKFLOW_RUN_NUMBER=5692069809
```

## Steps

Before getting started you need a build that has been made on Github Actions using your versioned wmde .env file.

This can be made automatically by CI if it is configured for your release, or also a manual build using Github Actions.

### Alter your local.env

Some of the prerequisutes can be used between publications, others needs to be set each time we want to publish a new release.

- Set `WORKFLOW_RUN_NUMBER` in your `local.env` file to the run you with to publish as a release (This will come from the summary page `actions/runs/<WORKFLOW_RUN_NUMBER>`)

### Download release artifacts

We will download artifacts that were created by a Github Action run (compressed releases, docker images, meta data) locally ready for publishing.

```
$ make download
...
Getting artifacts for run 1157808966
...
```

You'll be able to find the downloaded artifacts in `artifacts/<WORKFLOW_RUN_NUMBER>/`

### Verifying the downloaded artifacts

Before we consider a build for publishing some manual inspection of the artifacts should be done.


`artifacts/WORKFLOW_RUN_NUMBER/BuildMetadata/`

Contains the commit hashes for most of the components that was included in the build. Each file should contain a commit hash.

You can quickly look at these with the following:

```sh
tail -n +1 ./artifacts/<WORKFLOW_RUN_NUMBER>/BuildMetadata/*
```

`artifacts/WORKFLOW_RUN_NUMBER/TestArtifacts/`

Contains the docker log files for each suite and can easily be reviewed for any exceptions or error messages that might have passed testing unnoticed.

`artifacts/WORKFLOW_RUN_NUMBER/TestArtifacts/selenium/`

This folder contains screenshots that were taken after each test and can easily be reviewed for anything that looks off.

### Run tests on downloaded artifacts

To test the downloaded artifacts you can either load the images manually and use the [example](../../example/README.md) or to test a specific suite you can remove your local artifacts and replace them with the downloaded ones.

Remove locally created artifacts and use the downloaded ones

```
$ make clean
$ cp artifacts/WORKFLOW_RUN_NUMBER/BuildArtifacts/* artifacts/
$ make test SUITE=<suite-name>
```

After this you can follow the instructions as defined in [testing](testing.md) to run the desired tests. Remember that the test containers will remain running after a test run is completed. This can be useful when manually testing that the build looks ok. 

## Dry running

Publishing docker images and tarballs can be a scary business. To do a test-run of the publish scripts you can set the env variable `DRY_RUN` variable in your local.env file to test the execution with applying or uploading any changes.

```
DRY_RUN=1
```
This is supported by the tarball uploading and the dockerhub publishing scripts.

After a first dry run you can issue the following to command to remove the variable.

```sh
unset DRY_RUN
```

Or run each command without dry run

```sh
DRY_RUN="" ./command.sh
```

## Load release variables into your current shell

This will load the default `variables.env` file with your `local.env` overriding defaults where appropriate.

```sh
set -o allexport; source variables.env; source versions/<RELEASE_ENV>; source local.env; set +o allexport
```

## Publish to dockerhub

```sh
./publish/dockerhub.sh
```

## Publishing tarballs

Publishing of tarballs is done by a [bash script](../../Docker/publish/upload_tar/publish.sh) thats can be run within a docker-container, or directly on your system.
It creates a folder with the name of the `$RELEASE_MAJOR_VERSION` variable and uploads the tarballs created by the build.

After successfully uploading the tarballs they should be accessible at https://releases.wikimedia.org/wikibase/

### On your system

You should be able to SSH to the host specificed in `RELEASE_HOST` with no issues.
https://wikitech.wikimedia.org/wiki/SRE/Production_access#Setting_up_your_access

```sh
./publish/tar-nodocker.sh
```

### In docker

Make sure the `~/.ssh/config` contains a bastion host section where the user is specified.

```
# Configure the initial connection to the bastion host, with the one
# HostName closest to you
Host bast
    HostName bast3006.wikimedia.org
    IdentityFile ~/.ssh/id_production
    User <YourUsername>
```


Make sure you have the follow env variables set in your `local.env` file. Tarballs are to be hosted on releases.wikimedia.org. More information about this can be found [here](https://wikitech.wikimedia.org/wiki/Releases.wikimedia.org).

```
RELEASE_USER=username # Name of the user on RELEASE_HOST to use
RELEASE_SSH_IDENTITY=id_rsa # the production ssh identity filename to use
```

Run with in the terminal
*(Will ask you for the password to the identity file once)*

```
set -o allexport; source variables.env; source versions/<RELEASE_ENV>; source local.env; set +o allexport
./publish/tar.sh
```

## Update the example docker-compose

Once the release images are pushed to docker hub, and BEFORE tagging this repository the docker compose example should be updated to point to the new release on docker hub.

This is so that we can link to the example, using the tag that we will create in the next step.

The version used should be the latest release of the latest currently supported version of the images.

Take a look at the `.env` file in the `example` directory and update the image tags.

Example commit: https://github.com/wmde/wikibase-release-pipeline/commit/73f9942ebd92ded5f17fbb7f8537e9f2268e2bc4

## Update documentation references

Update the links to this repository in the [mediawiki.org documentation](https://www.mediawiki.org/wiki/Wikibase/Docker) to point to the tag [that was added to this repository](#tag-this-repository)

In particular links to the [example](../../example/README.md) folder.

## Announce new versions

Announcing new releases with the comcom team.
