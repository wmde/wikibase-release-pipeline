# wikibase-release-prototype

## Building locally
To locally build all artifacts set the following environment variables in an .env file

```
export WIKIBASE_IMAGE_NAME=wikibase
export QUERYSERVICE_IMAGE_NAME=wdqs
export QUERYSERVICE_UI_IMAGE_NAME=wdqs-ui

export QUERYSERVICE_VERSION=0.3.40
export COMMIT_HASH=e84ab35125557ff073f42ba522a684d35c288b38

# For testing. Replace with your queryservice ui and queryservice, mediawiki defaults to localhost:8080
export QUERYSERVICE_UI_SERVER=localhost:8081
export QUERYSERVICE_SERVER=localhost:8989
```

```
make all
```

## Testing Locally

You can run the tests in the docker container locally. Testing locally requires the built images.

```
source .env
```

```
bash test_scripts/test_docker.sh
```

# quibble-caching

To avoid cloning MediaWiki over the network, you should initialize local bare
repositories to be used as a reference for git to copy them from:

`
mkdir -p ref/mediawiki/skins
git clone --bare https://gerrit.wikimedia.org/r/mediawiki/core ref/mediawiki/core.git
git clone --bare https://gerrit.wikimedia.org/r/mediawiki/vendor ref/mediawiki/vendor.git
git clone --bare https://gerrit.wikimedia.org/r/mediawiki/skins/Vector ref/mediawiki/skins/Vector.git
`

We have `XDG_CACHE_HOME=/cache` set which is recognized by package managers.
Create a cache directory writable by any user:
`
install --directory --mode 777 cache
`
When running in a Docker container, mount the git repositories as a READ-ONLY
volume as `/srv/git` and the `cache` dir in read-write mode:

`
    docker run -it --rm -v "$(pwd)"/ref:/srv/git:ro -v "$(pwd)"/cache:/cache quibble
`
Commands write logs into `/workspace/log`, you can create one on the host and
mount it in the container:

# list artifacts for the repository

https://api.github.com/repos/wmde/wikibase-release-prototype/actions/artifacts
