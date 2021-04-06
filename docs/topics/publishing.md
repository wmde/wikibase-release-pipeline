# Publishing a successful build and test workflow

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
set -o allexport; source .env; source variables.env; source local.env; set +o allexport
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
set -o allexport; source .env; source variables.env; source local.env; set +o allexport
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
set -o allexport; source .env; source variables.env; source local.env; set +o allexport
./publish/git_tag.sh
```

Example output:
```
...

Use the following tag on Wikibase
git tag --force -a "wmde.0" "d9422cf7fe2c19d2096a158a68b1fa2d69e84406" -m "Tagging: wmde.0 Build: 581263144"


Use the following tag on Queryservice UI
git tag --force -a "wmde.0" "e84ab35125557ff073f42ba522a684d35c288b38" -m "Tagging: wmde.0 Build: 581263144"

...
```

Execute the commands in your local checked out repositories and push the tags using:
```
git push --tags
```
