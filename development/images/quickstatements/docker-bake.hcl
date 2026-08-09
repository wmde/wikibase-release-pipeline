# QuickStatements image manifest. Runtime build policy is supplied by wbs-dev.

variable "IMAGE_NAME" { default = "quickstatements" }
variable "IMAGE_VERSION" { default = "1.2.0" }
variable "IMAGE_REPOSITORY" { default = "wikibase/quickstatements" }
variable "TAGS" {
  type    = list(string)
  default = ["latest"]
}

# Selection, review, and version-impact policy: ./UPDATING.md
variable "QUICKSTATEMENTS_GENERATION" { default = "2" }

variable "QUICKSTATEMENTS" {
  default = {
    kind     = "github"
    name     = "QuickStatements"
    repo     = "https://github.com/magnusmanske/quickstatements.git"
    ref      = "refs/heads/master"
    revision = "5daef4bcb4a99eea27b3a3ccc10cae21e6c746f9"
  }
}

variable "MAGNUSTOOLS" {
  default = {
    kind           = "codeberg"
    name           = "MagnusTools"
    repo           = "https://codeberg.org/magnusmanske/magnustools.git"
    ref            = "refs/heads/master"
    revision       = "7d9b415bfab0ae624e17676be1e9d763f340b315"
    archive        = "https://codeberg.org/magnusmanske/magnustools/archive/{revision}.tar.gz"
    archive_sha256 = "f062fb7ff177a198dbc1a24a87775c2691cf64ed11a3e77c0b5bfc7ebf24ca4e"
  }
}

variable "COMPOSER_IMAGE" {
  default = {
    image    = "docker-registry.wikimedia.org/releng/composer-php82"
    tag      = "0.1.1-s2"
    platform = "linux/amd64"
    source   = "https://docker-registry.wikimedia.org/releng/composer-php82/tags/"
  }
}

variable "PHP_IMAGE" {
  default = {
    image  = "php"
    tag    = "8.3.8-apache-bookworm"
    source = "https://hub.docker.com/_/php"
    info   = "https://www.php.net/supported-versions.php"
  }
}

function "image_tags" {
  params = [tags]
  result = [for tag in tags : "${IMAGE_REPOSITORY}:${tag}"]
}

target "quickstatements-base" {
  context    = "."
  dockerfile = "Dockerfile"
  args = {
    QUICKSTATEMENTS_COMMIT   = QUICKSTATEMENTS.revision
    MAGNUSTOOLS_COMMIT       = MAGNUSTOOLS.revision
    MAGNUSTOOLS_ARCHIVE_SHA  = MAGNUSTOOLS.archive_sha256
    COMPOSER_IMAGE_URL       = "${COMPOSER_IMAGE.image}:${COMPOSER_IMAGE.tag}"
    COMPOSER_IMAGE_PLATFORM  = COMPOSER_IMAGE.platform
    PHP_IMAGE_URL            = "${PHP_IMAGE.image}:${PHP_IMAGE.tag}"
  }
  labels = {
    "org.opencontainers.image.source"  = "https://github.com/wmde/wikibase-release-pipeline"
    "org.opencontainers.image.version" = IMAGE_VERSION
  }
}

target "quickstatements" {
  inherits = ["quickstatements-base"]
  tags     = image_tags(TAGS)
  output   = [{ type = "docker" }]
}

target "quickstatements-release" {
  inherits = ["quickstatements-base"]
  tags = image_tags([
    IMAGE_VERSION,
    split(".", IMAGE_VERSION)[0],
    join(".", slice(split(".", IMAGE_VERSION), 0, 2)),
    "qs${QUICKSTATEMENTS_GENERATION}"
  ])
}

group "default" { targets = ["quickstatements"] }
