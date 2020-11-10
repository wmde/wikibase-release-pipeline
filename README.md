# wikibase-release-prototype

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