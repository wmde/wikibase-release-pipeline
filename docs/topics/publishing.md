# Publishing a successful build and test workflow to dockerhub

## Make sure to set variables like this before running:
```
DOCKER_HUB_REPOSITORY_NAME=toanwmde
DOCKER_HUB_ID=toanwmde
DOCKER_HUB_ACCESS_TOKEN=mysecrettokenigotfromdockerhub
WORKFLOW_RUN_NUMBER=465817659 # workflow to publish from
GITHUB_TOKEN=mygithubtoken
```

If desired you can keep the tokens and the usernames set in a `local.env` that is git ignored

Run with:
`./publish_docker.sh`