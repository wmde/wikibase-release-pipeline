# Wikibase Suite (WBS) Versions

Wikibase Suite (WBS) and each of its images have independent version numbers. They all use [semantic versioning](https://semver.org/spec/v2.0.0.html), written as `MAJOR.MINOR.PATCH`.

## WBS versions

A WBS version identifies the product configuration in this repository, including the Docker Compose file and the compatible major versions of its images. WBS 8 and later releases use Git tags such as `wbs@8.0.1`.

Compare the current and target versions from left to right. The first number that changes determines the update type:

| Update type | Example | What it means |
| --- | --- | --- |
| Patch | `8.0.0` → `8.0.1` | A compatible fix. Follow the [minor and patch update procedure](./operating/updating.md#minor-and-patch-updates). |
| Minor | `8.0.1` → `8.1.0` | Compatible new functionality. Follow the [minor and patch update procedure](./operating/updating.md#minor-and-patch-updates). |
| Major | `8.1.0` → `9.0.0` | An update that may contain breaking changes. Follow the [major-version guide](./operating/updating.md#major-version-upgrades) for that specific transition. |

WBS 7 and earlier releases use `deploy@MAJOR.MINOR.PATCH` tags. WBS 8 and later releases use `wbs@MAJOR.MINOR.PATCH` tags.

## Image versions

The Wikibase, Query Service, Query Service frontend, OpenSearch, QuickStatements, and WBS tools images are released and versioned separately from WBS. Most image references in a WBS release use compatible major-version tags. For example, a WBS release might reference `wikibase/wikibase:7`, which points to the latest `7.x.x` release of the Wikibase image.

The WBS tools image is an exception: installation scripts select an exact version, such as `wikibase/wbs-tools:1.0.0`, because the tools run against and modify the WBS checkout.

WBS images publish the following shared tags:

| Tag | Example | What it means |
| --- | --- | --- |
| `MAJOR` | `7` | Moves to the latest minor or patch release within that major version. WBS uses these tags so compatible image updates can be pulled without changing the WBS version. |
| `MAJOR.MINOR` | `7.1` | Moves to the latest patch release within that minor version. |
| `MAJOR.MINOR.PATCH` | `7.1.0` | Identifies a specific image release. |

Some images also publish tags for the version of the software they contain, such as the bundled MediaWiki or Query Service version. See the [WBS Images Guide](./images/README.md) for details.

Docker tags can be updated. If you need to pin the exact image contents rather than receive updates through a tag, use the image digest.

## How updates relate

- Updating WBS to a new patch or minor version requires switching to the corresponding WBS Git tag.
- Updating an image within its current major version requires pulling the newer image; the WBS Git tag does not change.
- Moving an image to a new major version is handled by a WBS release and its upgrade instructions. Do not change image major versions independently unless you maintain a custom configuration.
- Updating the WBS tools image requires a WBS release that selects the new exact tools version.
