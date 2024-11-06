# Releases

Official releases of this image can be found on [Docker Hub wikibase/wikibase](https://hub.docker.com/r/wikibase/wikibase).

## Tags and versioning

This Wikibase image is using [semantic versioning](https://semver.org/spec/v2.0.0.html).

We provide several tags that relate to the versioning semantics.

| Tag                                             | Example                   | Description                                                                                                                                                                                                                                |
| ----------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| _MAJOR_                                         | 3                         | Tags the latest image with this major version. Gets overwritten whenever a new version is released with this major version. This will include new builds triggered by base image changes, patch version updates and minor version updates. |
| _MAJOR_._MINOR_                                 | 3.1                       | Tags the latest image with this major and minor version. Gets overwritten whenever a new version is released with this major and minor version. This will include new builds triggered by base image changes and patch version updates.    |
| _MAJOR_._MINOR_._PATCH_                         | 3.1.7                     | Tags the latest image with this major, minor and patch version. Gets overwritten whenever a new version is released with this major, minor and patch version. This only happens for new builds triggered by base image changes.            |
| _MAJOR_._MINOR_._PATCH_\_mw*MW-VERSION*         | 3.1.7_mw1.41.1            | Same as above, but also mentioning the current MediaWiki version.                                                                                                                                                                          |
| _MAJOR_._MINOR_._PATCH_\_build*BUILD-TIMESTAMP* | 3.1.7_build20240530103941 | Tag that never gets overwritten. Every image will have this tag with a unique build timestamp. Can be used to reference images explicitly for reproducibility.                                                                             |

