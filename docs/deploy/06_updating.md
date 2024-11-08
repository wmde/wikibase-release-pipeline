# Updating and Versioning

WBS uses [semantic versioning](https://semver.org/spec/v2.0.0.html). The WBS Deploy and all the WBS images have individual version numbers.

WBS Deploy always references the latest minor and patch releases of the compatible WBS images' major versions using the images' major version tag.

## Example

Let's say the `wikibase` image version 1.0.0 is the initial version released with WBS Deploy 3.0.0. In that case, the `wikibase` image carrying the `1.0.0` tag will also carry a `1` tag. When the `wikibase` image version is bumped to 1.1.0 for a feature release, a new image is released and tagged with `1.1.0`. The `1` tag will then be reused and now point to the newly released image 1.1.0.

This way, WBS Deploy can always reference the latest compatible version by using the major version tag. Nothing needs to be updated in WBS Deploy itself. If the `wikibase` image version gets bumped to 2.0.0, that indicates a breaking change; in this case the new image would not receive the `1` tag. Instead, a new version of WBS Deploy would be released (in this case 4.0.0) and this one would use a new major version tag called `2` to reference the Wikibase image.

WBS Deploy may also receive minor and patch updates, but, as noted above, they are not required to update related WBS images.

## Minor and patch updates for WBS images

Because WBS Deploy always references the latest minor and patch releases of compatible WBS images, non-breaking changes (including security updates) can be pulled at any time.

This is always safe to do. Simply run:

```sh
docker compose down
docker compose pull
docker compose up
```

> 💡 In order to automatically update images on every start, you can also use `docker compose up --pull always` to start your WBS Deploy stack.
 

## Minor and patch updates for WBS Deploy

WBS Deploy major versions are tracked in dedicated branches such as `deploy-3`. Pulling from the major version branch you are currently on will only update minor and patch versions and will never trigger breaking changes.

These updates are **always** considered safe.

If you did not change `docker-compose.yml`, you can update simply by running `git pull`.

```sh
git pull
```
> 💡 If you have made changes to `docker-compose.yml`, commit them to a separate branch and merge them with upstream changes as you see fit.

> 💡 Each major version of WBS Deploy always references exactly one major version of each of the WBS images. Thus, updating WBS Deploy minor and patch versions from a major version's git branch will never lead to breaking changes in WBS service images.

## Major upgrades

Major version upgrades are performed by updating WBS Deploy's major version. This is done by changing your git checkout to the new major version branch. This may reference new major versions of WBS images or involve breaking changes. In turn, those may require additional steps as described below.

WBS only supports updating from one major version to the next version in sequence. In order to upgrade from 1.x.x to 3.x.x, you must first upgrade from 1.x.x to 2.x.x and then to 3.x.x.

### Bring down your instance

```sh
docker compose down
```

### Back up your data and config

[Create a backup](./05_data.md#backup-your-data) of your data.

Back up your `./config` directory as well using:
```
cp -r ./config ./config-$(date +%Y%M%d%H%M%S)
```

> 💡 If you made changes to `docker-compose.yml`, commit them to a separate branch and merge them as you see fit in the next step.

### Pull new version

WBS Deploy major versions are tracked in separate branches called `deploy-MAJOR_VERSION`, such as `deploy-2` or `deploy-3`. Change your checkout to the new major version branch.

```sh
git remote update
git checkout deploy-MAJOR_VERSION
git pull
```

> 💡 If you made changes to `docker-compose.yml`, merge them as you see fit.

### Apply any changes to .env

Look for changes in the new `template.env` that you might want to apply to your `.env` file.

<!-- ##### Apply any migrations for your version -->
<!---->
<!-- <details><summary><strong>WBS Deploy 2.x.x to 3.x.x (MediaWiki 1.41 to MediaWiki 1.42)</strong></summary><p> -->
<!---->
<!-- Read the [MediaWiki UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_42/UPGRADE). -->
<!---->
<!-- No Wikibase-specific migrations are necessary. -->
<!---->
<!-- </p></details> -->
<!---->
<!-- <details><summary><strong>WBS Deploy 1.x.x to 2.x.x (MediaWiki 1.39 to MediaWiki 1.41)</strong></summary><p> -->
<!---->
<!-- Read the [MediaWiki UPGRADE file](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/REL1_41/UPGRADE). -->
<!---->
<!-- No Wikibase-specific migrations are necessary. -->
<!---->
<!-- </p></details> -->

##### Bring your instance back up

```
docker compose up
```

## Automatic updates

At the moment, WBS Deploy does not support automatic updates. To automatically deploy minor and patch updates including security fixes to your WBS images, restart your instance on a regular basis with a systemd timer, cron job, or similar.

## Downgrades

Downgrades are not supported. In order to revert an update, restore your data from a backup made prior to the upgrade.

