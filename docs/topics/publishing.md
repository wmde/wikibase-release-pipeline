# Publishing a successful build and test workflow

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
./publish_docker.sh
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
RELEASE_SSH_IDENTITY=id_rsa # the production ssh identity filename to use
```

Run with in the terminal
*(Will ask you for the password to the identity file once)*

```
set -o allexport; source .env; source variables.env; source local.env; set +o allexport
./publish_tar.sh
```

After successfully uploading the tarballs they should be accessible at https://releases.wikimedia.org/wikibase/

## Publish git tags

Together with the other publishing steps we also need to tag what commit in the gerrit repository with the version number we built and published. This is done by the [tag_git](../../Docker/tag_git/tag_git.sh) bash script that is run within a docker container. 

The script clones from the git_cache then relies on the build artifact found within `BuildMetadata/build_metadata.env` which stores the commit hashes for the repositories we want to tag.    

Make sure you have the follow env variables set in your `local.env` file. 
```
WORKFLOW_RUN_NUMBER=465817659 # workflow to publish from
```

In order to test the script you can set the env variable `DRY_RUN` to something in your `local.env` file to do the tagging locally without pushing anything to gerrit.

Example:
```
DRY_RUN=1 # add this to the command or your local.env file

# to unset it write
$ unset DRY_RUN
```

Run with:
```
set -o allexport; source .env; source variables.env; source local.env; set +o allexport
./publish_git_tag.sh
```
