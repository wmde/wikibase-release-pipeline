Todo:

- [ ] move nx build task to build/workspace.json, and make different run for local and ci (or pr and release)
- [ ] make sure the ./nx build wikibase --can-tag-params-that-get-forwarded-to-buildx
- [ ] Look into build_test_publish / ./nx release --dry-run for handling tagging (use default tags in imagel, so buildx without --set default.tags)

# Setting-up a local repository for storing/testing multi-platform builds

Ref. https://www.luu.io/posts/multi-platform-docker-image:

1. `docker buildx create --name mybuilder --bootstrap --platform linux/amd64,linux/arm64 --use --config mybuilderconfig.toml` \*
2. `docker run -d -p 5000:5000 --name registry registry`
3. `docker buildx build . --platform=linux/amd64,linux/arm64 --push --tag localhost:5000/wikibase/wbs-dev-runner:latest`

```
# mybuilderconfig.toml
[registry."myregistry.lan:5000"]
http = true
insecure = true
```

# Setting up the multi platform builders and building

```

#!/bin/bash

# Create and configure builders for each platform
docker buildx create --name builder-arm64 --platform linux/arm64
docker buildx create --name builder-amd64 --platform linux/amd64

# Create a multi-builder that includes both platform-specific builders
docker buildx create --name multi-builder --driver docker-container --use
docker buildx create --append --name multi-builder --platform linux/arm64 --node builder-arm64
docker buildx create --append --name multi-builder --platform linux/amd64 --node builder-amd64

# Run docker buildx bake for the multi-platform build
docker buildx bake --progress=plain
```

# A docker-bake.hcl WIP for wikibase

```
variable "IMAGE_NAME" {
  default = "wikibase"
}
variable "IMAGE_NAMESPACE" {
  default = "wikibase"
}
variable "IMAGE_REGISTRY" {}
variable "IMAGE_VERSION" {
  default = "3.0.0"
}
variable "MEDIAWIKI_VERSION" {
  default = "1.42.1"
}

target "default" {
  args = {
    MEDIAWIKI_VERSION                    = MEDIAWIKI_VERSION
    PHP_IMAGE_URL                        = "php:8.3.8-apache-bookworm"
    COMPOSER_IMAGE_URL                   = "docker-registry.wikimedia.org/releng/composer-php82:0.1.1-s2"
    BABEL_COMMIT                         = "d67b57379ae9d4ebb68ae764a6f9d05c8bf6c87d"
    CIRRUSSEARCH_COMMIT                  = "9cfe80151727a6950d278238f54db31aee889dd0"
    CLDR_COMMIT                          = "6c28f1b99f9a7ea0eb7e11f48102805fd11a337d"
    ELASTICA_COMMIT                      = "382af148ab67640ca2ce213df245a1617487db68"
    ENTITYSCHEMA_COMMIT                  = "7e66b541c9c0dec2caf316c9525334fbbf397ec5"
    OAUTH_COMMIT                         = "fccfb680cc4bc9eae094f0356967e1b77faa88c9"
    UNIVERSALLANGUAGESELECTOR_COMMIT     = "752ea5965b7b93f4e14fa861d587b0966b15413d"
    WIKIBASECIRRUSSEARCH_COMMIT          = "0d8f5907ea9f4274e28ea2707440b176b2d8c071"
    WIKIBASEEDTF_COMMIT                  = "6e8ebf2818de4dd43a3f39d290e46a1626db1b22"
    WIKIBASELOCALMEDIA_COMMIT            = "b2aac56b81c25cd04708f1019a833c81f074a1f2"
    WIKIBASEMANIFEST_COMMIT              = "5413c72af830a031fbf485b9c6b9e49057ac88c3"
    WIKIBASE_COMMIT                      = "1255c6e3ce8c14b72f0fa49ad98ba5fb388fbc0c"
  }
  platforms = ["linux/amd64", "linux/arm64"]
  tags = [
    "${notequal("", IMAGE_REGISTRY) ? "" : "${IMAGE_NAMESPACE}/${IMAGE_NAME}:latest"}",
    "${notequal("", IMAGE_REGISTRY) ? "${IMAGE_REGISTRY}/" : ""}${IMAGE_NAMESPACE}/${IMAGE_NAME}:${IMAGE_VERSION}",
    "${notequal("", IMAGE_REGISTRY) ? "${IMAGE_REGISTRY}/" : ""}${IMAGE_NAMESPACE}/${IMAGE_NAME}:${split(".", IMAGE_VERSION)[0]}.${split(".", IMAGE_VERSION)[1]}",
    "${notequal("", IMAGE_REGISTRY) ? "${IMAGE_REGISTRY}/" : ""}${IMAGE_NAMESPACE}/${IMAGE_NAME}:${split(".", IMAGE_VERSION)[0]}",
    "${notequal("", IMAGE_REGISTRY) ? "${IMAGE_REGISTRY}/" : ""}${IMAGE_NAMESPACE}/${IMAGE_NAME}:mw${MEDIAWIKI_VERSION}"
  ]
}
```
