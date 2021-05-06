

# Publishing a successful build

## Checklist for releasing

- [ ] Download and verify release artifacts
- [ ] Publish to dockerhub
- [ ] Publish to releases.wikimedia.org
- [ ] Publish git tags
- [ ] Announce new release on [wikibaseug](https://lists.wikimedia.org/mailman/listinfo/wikibaseug)

### Download release artifacts

After the build and test workflow has successfully completed it is time to download the results and prepare to publish it as a release.

This can be done by setting the `WORKFLOW_RUN_NUMBER` variable in your local.env file and source it into the shell and execute the following command.

```sh
$ ./publish/download.sh
```

This will download the build, test and metadata artifacts for the workflow run into `artifacts/WORKFLOW_RUN_NUMBER/`

### Verifying the downloaded artifacts

Before we consider a build for publishing some manual inspection of the artifacts should be done.

`artifacts/WORKFLOW_RUN_NUMBER/BuildMetadata/`

Contains the commit hashes for most of the components that was included in the build. Each file should contain a commit hash.

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
$ make test SUITE=fedprops
```

After this you can follow the instructions as defined in [testing](testing.md) to run the desired tests. Remember that the test containers will remain running after a test run is completed. This can be useful when manually testing that the build looks ok. 

## Dry running

Publishing docker images and tarballs can be a scary business. To do a test-run of the publish scripts you can set the env variable `DRY_RUN` variable in your local.env file to test the execution with applying or uploading any changes.

```
DRY_RUN=1
```
This is supported by the tarball uploading and the dockerhub publishing scripts. The git-tagging scripts is just outputting the commands for later execution.

After a first dry run you can issue the following to command to remove the variable.

```
unset DRY_RUN
```

## Publish to dockerhub
### Make sure to set variables like this before running:
```
DOCKER_HUB_REPOSITORY_NAME=toanwmde
DOCKER_HUB_ID=toanwmde
DOCKER_HUB_ACCESS_TOKEN=mysecrettokenigotfromdockerhub
WORKFLOW_RUN_NUMBER=465817659 # workflow to publish from
GITHUB_TOKEN=mygithubtoken
```

If desired you can keep the tokens and the usernames set in a `local.env` that is git ignored

Run with:

```
set -o allexport; source versions/<RELEASE_ENV>; source variables.env; source local.env; set +o allexport
./publish/dockerhub.sh
```

## Publishing tarballs

Publishing of tarballs is done by a [bash script](../../Docker/upload_tar/publish.sh) thats run within a docker-container. It creates a folder with the name of the `$RELEASE_MAJOR_VERSION` variable and uploads the tarballs created by the build.

Make sure the `~/.ssh/config` contains a bastion host section where the user is specified.

```
# Configure the initial connection to the bastion host, with the one
# HostName closest to you
Host bast
    HostName bast3004.wikimedia.org
    IdentityFile ~/.ssh/id_production
    User <YourUsername>
```


Make sure you have the follow env variables set in your `local.env` file. Tarballs are to be hosted on releases.wikimedia.org. More information about this can be found [here](https://wikitech.wikimedia.org/wiki/Releases.wikimedia.org).

```
WORKFLOW_RUN_NUMBER=465817659 # workflow to publish from
RELEASE_HOST=releases1002.eqiad.wmnet
RELEASE_USER=username # Name of the user on RELEASE_HOST to use
RELEASE_SSH_IDENTITY=id_rsa # the production ssh identity filename to use

```

Run with in the terminal
*(Will ask you for the password to the identity file once)*

```
set -o allexport; source versions/<RELEASE_ENV>; source variables.env; source local.env; set +o allexport
./publish/tar.sh
```

After successfully uploading the tarballs they should be accessible at https://releases.wikimedia.org/wikibase/

## Publish git tags

Together with the other publishing steps we also need to tag what commit in the gerrit repository with the version number we built and published. This is done by executing the commands given by the [tag_git](../../Docker/tag_git/tag_git.sh) bash script that is run within a docker container.

The script relies on the build metadata artifacts found within the folder of the downloaded workflow run.

Example: `artifacts/<WORKFLOW_RUN_NUMBER>/BuildMetadata/build_metadata_wikibase.env`

This file stores the commit hashes for the repositories we want to tag.

Make sure you have the follow env variables set in your `local.env` file. 
```
WORKFLOW_RUN_NUMBER=465817659 # workflow to publish from
```

Run with:
```
set -o allexport; source versions/<RELEASE_ENV>; source variables.env; source local.env; set +o allexport
./publish/git_tag.sh
```

Example output:
```
...

Use the following tag on Wikibase
git tag --force -a "wmde.0" "d9422cf7fe2c19d2096a158a68b1fa2d69e84406" -m "Tagging: wmde.0 Build: 581263144"


Use the following tag on WDQS frontend
git tag --force -a "wmde.0" "e84ab35125557ff073f42ba522a684d35c288b38" -m "Tagging: wmde.0 Build: 581263144"

...
```

Execute the commands in your local checked out repositories and push the tags using:
```
git push --tags
```

## Announce new versions

Announcing new releases should be done to:

- external https://lists.wikimedia.org/mailman/listinfo/wikibaseug