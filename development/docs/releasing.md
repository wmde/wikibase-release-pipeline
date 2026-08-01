# Release process

Wikibase Suite releases are prepared in a pull request and published from committed versions and changelogs after that pull request reaches `main`. Release automation is intentionally tag-only: it does not choose versions, rewrite manifests, or generate changelogs.

## Releasable projects

| Project | Version source | Changelog | Release tag | Published result |
| --- | --- | --- | --- | --- |
| WBS product | `package.json` | `CHANGELOG.md` | `wbs@<version>` | Release becomes discoverable to the installer |
| Each image | `development/images/<image>/package.json` | `development/images/<image>/CHANGELOG.md` | `<image>@<version>` | Versioned image tags are published to Docker Hub |

The image projects are `opensearch`, `quickstatements`, `wbs-tools`, `wdqs`, `wdqs-frontend`, and `wikibase`.

## 1. Prepare the implementation

Start from an up-to-date `main` and create a release branch:

```bash
git switch main
git pull --ff-only
git switch -c <release-branch>
```

For a MediaWiki-line update:

1. Update `MEDIAWIKI_VERSION` in `development/images/wikibase/build.env`.
2. Refresh supported upstream source pins:

   ```bash
   development/wbs-dev update-commits
   ```

3. Verify the OpenSearch version supported by the selected MediaWiki/CirrusSearch line. Update `OPENSEARCH_VERSION` and the Wikimedia plugin versions in `development/images/opensearch/build.env` when needed.
4. Separately check the latest usable WDQS service artifact and update `WDQS_VERSION` in `development/images/wdqs/build.env` when appropriate.
5. Review all generated changes rather than assuming the latest upstream commit or artifact is compatible.

Build, lint, and run the complete integration suite from the repository root:

```bash
development/wbs-dev build
development/wbs-dev lint
development/wbs-dev test
```

Repeat this loop until the release candidate is stable. Tests use existing local images and do not build them automatically.

## 2. Curate versions and changelogs

For each changed project that will be released:

1. Set the intended semantic version in its package manifest.
2. Add a release entry to its changelog. Summarize user-visible behavior, important upstream changes, compatibility notes, and breaking changes; commit subjects are inputs, not a generated changelog.
3. When the WBS product version changes, update both the root `package.json` and root `CHANGELOG.md`.
4. Keep `DEPLOY_VERSION` in `docker-compose.yml` exactly equal to the root package version. CI's version-reporting test enforces this.
5. When WBS should use a new exact `wbs-tools` image, update the pin in `tools/scripts/_versions.sh` and include the `wbs-tools` image in the release.

The [Conventional Commits guide](./conventional-commits.md) describes how release impact is recorded in history, but no automation currently turns that history into versions or changelogs.

## 3. Review and merge

Push the release branch and open a pull request against `main`. After CI passes, request review from the `wikibase-suite` team. Merge only after the committed versions, changelogs, image references, and test results have been reviewed.

Coordinate community announcement timing with the Developer Advocate before publishing the tags.

## 4. Audit the release tags

From the GitHub Actions page, run **Create a WBS Release** on `main` with `dry_run=true` for each project to be released. The workflow first runs the full build and test pipeline, then reports the tag derived from the committed package version and whether it already exists on `origin`.

The workflow creates tags shaped as `<package-name>@<version>`. A dry run does not create or push anything.

## 5. Publish images before WBS

For a coordinated product release, publish each changed image before creating the `wbs@<version>` tag:

1. Run **Create a WBS Release** with the image selected and `dry_run=false`.
2. Wait for that tag's **Build and Publish a WBS Image Release to Dockerhub** workflow to pass.
3. Verify the expected version, major/minor, and major image tags on Docker Hub.
4. Repeat for the other changed images.
5. If the release changes the exact `wbs-tools` pin, ensure that image is available before proceeding.

Image tags trigger another complete build/test run before `development/wbs-dev publish <image>` pushes the official Docker Hub tags.

The **All projects with unreleased changes** option audits all known projects and skips tags already present on `origin`; it does not determine release scope from changelog content. It also pushes tags in workflow order and does not wait for image publication before pushing the WBS tag. Do not use it for a coordinated WBS release that depends on newly published images. Explicit project runs make the required ordering observable.

## 6. Publish the WBS product tag

After all required images are available, run **Create a WBS Release** for `wbs` with `dry_run=false`. The `wbs@<version>` tag makes that committed product release discoverable to the installer; it does not publish a Docker image.

Confirm that a fresh installation resolves the intended WBS tag and image versions. For a release that changes installer behavior, also confirm the `wbs-tools` integration suite passed for the release commit.

## Re-running and correcting releases

The Create Release workflow skips tags that already exist on `origin`, so a run can be repeated after an unrelated failure. Never move or overwrite a published release tag. If a committed version or release artifact is wrong, fix it forward in a reviewed pull request and publish a new version.
