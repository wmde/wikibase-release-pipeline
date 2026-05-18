# Wikibase Suite image versioning

Wikibase Suite (WBS) and the WBS Docker images use [semantic versioning](https://semver.org/spec/v2.0.0.html). WBS and each WBS image have individual version numbers.

The full WBS configuration has its own version tags and update process. For updating a WBS instance, see [Upgrading](../deploy/docs/updating.md).

## Image tags

WBS images publish several tags that reflect the image version.

| Tag | Example | Description |
| --- | --- | --- |
| _MAJOR_ | 3 | Tags the latest image with this major version. This tag is updated when a new release is published for the same major version, including minor releases, patch releases, and rebuilds for base image changes. |
| _MAJOR_._MINOR_ | 3.1 | Tags the latest image with this major and minor version. This tag is updated when a new release is published for the same major and minor version, including patch releases and rebuilds for base image changes. |
| _MAJOR_._MINOR_._PATCH_ | 3.1.7 | Tags the latest image with this major, minor, and patch version. This tag is only updated for rebuilds of that exact version, such as rebuilds for base image changes. |
| _MAJOR_._MINOR_._PATCH_\_build*BUILD-TIMESTAMP* | 3.1.7_build20240530103941 | Tags one specific image build. This tag is not overwritten and can be used to reference an image explicitly for reproducibility. |
