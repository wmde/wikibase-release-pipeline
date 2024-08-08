# GitHub action for build

Using https://github.com/nrwl/nx-set-shas to track BASE and HEAD git SHAs for nx affected

1. `nx affected -t build`: only run "build" target on affected projects, tag each image wih the NX_HEAD commit SHA and the actions-run-id
2. for NON_AFFECTED projects pull from ghcr for BASE tag, if it doesn't exist build and tag with BASE and actions-run-id

# GitHub action for test, etc

1. pull latest from GHCR for all images with the actions-run-id

---

Returns the commit SHA of the last change in the specified directory, here build/wikibase:

`git log -1 --format="%H" -- build/wikibase`
