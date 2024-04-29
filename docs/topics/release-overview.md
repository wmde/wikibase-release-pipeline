# Wikibase release process overview

Wikibase and related software gets release through this repository. The process for releasing involves defining the release in this repository, testing all the components of the release together and finally publishing them.

=== Release Checklist

[ ] **Pending issues as subtasks**. If any open tickets need to be resolved and related changes need to be included in the release, add them as subtasks of this release ticket. (If this release is triggered by a Mediawiki bugfix release, consider only including bug/security issue fixes and avoid breaking changes.)

[ ] **Create branches**

- **For bugfix releases**
  - **Create a release preparation branch.** The release branch already exists. E.g. `mw-1.40`. Create a release preparation branch off of the existing release branch. E.g. `releaseprep-1.40.2` off of `mw-1.40`. Do not name it `mw-*` as this is the reserved naming scheme for our release branches.
  - **Backport changes from main if really needed.** Bugfix releases should contain as little changes as possible. Make sure that the `variables.env` file is not changed by incoming changes from main.
- **For major releases**
  - **Create a new release branch off of main.** E.g. `mw-1.44`. This branch is now equal to main. It will hold all bugfix releases for that major version in the future.
  - **Create a release preparation branch off of that release branch.** E.g. `releaseprep-1.44.0`. This second branch is meant to prepare the first release on that release branch.

[ ] **Update `variables.env`** on the release preparation branch. Find further instruction in the [variables.env](https://github.com/wmde/wikibase-release-pipeline/blob/main/variables.env) file itself.

[ ] **Update `CHANGES.md`** on the release preparation branch. Add a section following the example of previous releases, update the different values. The spec will eventually point to the release tags variables.env once the release is published.

[ ] **Create a release PR** that merges the release preparation branch e.g. `releaseprep-1.44.0` into release branch e.g. `mw-1.44`.

[ ] **CI should be green**. Tests may need adjustments in order to pass for the new version. Bugfix releases are likely to pass without any adjustments.

[ ] **Do a sanity check by manually reviewing a running instance**. This could be done locally on your machine or by [deploying](https://docs.google.com/document/d/1BGxcqt9CHbb-8dfWjK-lZmNoNcD08urb23JqtgoVTeg/edit#heading=h.6a8ctlepqn5d) it to the [test system](https://wikibase-product-testing.wmcloud.org). You find built images from your PR on GHCR (e.g. [here](https://github.com/wmde/wikibase-release-pipeline/pkgs/container/wikibase%2Fwikibase-bundle)) tagged with `dev-BRANCHNAME`, e.g. `dev-releaseprep-wmde.17`. This tag can be referenced in example to setup an instance running your PR version.

[ ] **Get two reviews on the release preparation PR**. So that it is technically ready to be merged. The merge will trigger the release to dockerhub later.

[ ] **Prepare communication** by creating a [release announcement](https://drive.google.com/drive/folders/1kHhKKwHlwq_P9x4j8-UnzV72yq0AYpsZ) based on existing one.

[ ] **Agree with ComCom on a timing to publish the release**. Talk to ComCom and TechWriter about that.

[ ] **Publish the release** by merging the release preparation branch into the release branch. ‼️ ‼️ ‼️ **This will automatically push docker images to docker hub and therefore release the new version!**

[ ] **Update the [docker install instructions](https://www.mediawiki.org/wiki/Wikibase/Docker)** to reflect the latest version. If you made a bugfix release for an older release, this can be skipped.

[ ] **Make sure the communication is sent.**

[ ] **Update the example directory** ☠️☠️☠️ For this to happen, we currently need to merge another PR to the release branch. This PRs only change should be making the example reference the new version. For this PRs pipeline to properly run, you need to manually delete the git tag of your just released version from the github repo before merging. Merging this example update PR is technically a re-release. This weirdness will hopefully be fixed soon.

[ ] **Merge back to main**. Decide whether there is stuff you want to merge back to main on the release branch.

You are done. **Congratulations!**
