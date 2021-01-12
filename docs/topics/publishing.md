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