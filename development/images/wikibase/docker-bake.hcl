# Wikibase image manifest
#
# Image-specific source, build, metadata, and tagging configuration lives here.
# Builder, cache, output, and target-platform policy is supplied by wbs-dev or
# additional Bake files.

variable "IMAGE_NAME" {
  default = "wikibase"
}

variable "IMAGE_VERSION" {
  default = "8.1.0"

  validation {
    condition     = can(regex("^[0-9]+\\.[0-9]+\\.[0-9]+$", IMAGE_VERSION))
    error_message = "IMAGE_VERSION must be a stable MAJOR.MINOR.PATCH version."
  }
}

variable "IMAGE_REPOSITORY" {
  default = "wikibase/wikibase"
}

variable "TAGS" {
  type    = list(string)
  default = ["latest"]
}

# ==============================================================================
# MediaWiki
# ==============================================================================
# Selection, compatibility, and version-impact policy: ./UPDATING.md

variable "MEDIAWIKI" {
  default = {
    version       = "1.46.0"
    source        = "https://releases.wikimedia.org/mediawiki/"
    release_notes = "https://www.mediawiki.org/wiki/Release_notes/{line}"
  }
}

# Wikimedia-maintained extensions follow the selected MediaWiki release line.
variable "WMF_EXTENSION_REF" {
  default = "refs/heads/REL${split(".", MEDIAWIKI.version)[0]}_${split(".", MEDIAWIKI.version)[1]}"
}

# ==============================================================================
# Base images
# ==============================================================================

variable "COMPOSER_IMAGE" {
  default = {
    image    = "docker-registry.wikimedia.org/releng/composer-php83"
    tag      = "8.3.23-s5"
    platform = "linux/amd64"
    source   = "https://docker-registry.wikimedia.org/releng/composer-php83/tags/"
  }
}

# Update only patch versions for security releases.
# Choose the latest LTS version for major releases.
variable "PHP_IMAGE" {
  default = {
    image  = "php"
    tag    = "8.3.23-apache-bookworm"
    source = "https://hub.docker.com/_/php"
    info   = "https://www.php.net/supported-versions.php"
  }
}

# ==============================================================================
# Wikimedia-maintained extensions
# ==============================================================================

variable "WIKIBASE" {
  default = {
    kind     = "gerrit"
    name     = "Wikibase"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/Wikibase"
    ref      = WMF_EXTENSION_REF
    revision = "f62f48ccf21c13cf5d129df501736580a972a846"
  }
}

variable "BABEL" {
  default = {
    kind     = "gerrit"
    name     = "Babel"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/Babel"
    ref      = WMF_EXTENSION_REF
    revision = "d0bc56f94e2fd13532c6ddf8b0ba3743d3f7bce6"
  }
}

variable "CLDR" {
  default = {
    kind     = "gerrit"
    name     = "cldr"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/cldr"
    ref      = WMF_EXTENSION_REF
    revision = "df46697fe3fda0d5a185eb7204f1e463f2f2b9ec"
  }
}

variable "CIRRUSSEARCH" {
  default = {
    kind     = "gerrit"
    name     = "CirrusSearch"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/CirrusSearch"
    ref      = WMF_EXTENSION_REF
    revision = "04a58b2f1cba6372bba550dce5720182df937a8f"
  }
}

variable "ELASTICA" {
  default = {
    kind     = "gerrit"
    name     = "Elastica"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/Elastica"
    ref      = WMF_EXTENSION_REF
    revision = "bc44b8c5f15fa1e927fb43a32c22237b6fd0dfbc"
  }
}

variable "ECHO" {
  default = {
    kind     = "gerrit"
    name     = "Echo"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/Echo"
    ref      = WMF_EXTENSION_REF
    revision = "314bfedd6cfea7574a2375fab2a007a260d9856a"
  }
}

variable "ENTITYSCHEMA" {
  default = {
    kind     = "gerrit"
    name     = "EntitySchema"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/EntitySchema"
    ref      = WMF_EXTENSION_REF
    revision = "a53c0b4049e4e804b17dda4250d8c0a6fcb8072d"
  }
}

variable "OAUTH" {
  default = {
    kind     = "gerrit"
    name     = "OAuth"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/OAuth"
    ref      = WMF_EXTENSION_REF
    revision = "41369bf47b4b612324482c22f7bf15d3803d30ee"
  }
}

variable "PLUGGABLEAUTH" {
  default = {
    kind     = "gerrit"
    name     = "PluggableAuth"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/PluggableAuth"
    ref      = WMF_EXTENSION_REF
    revision = "b758a14b00904aab3d50b4409e687de9d6d9d53e"
  }
}

variable "UNIVERSALLANGUAGESELECTOR" {
  default = {
    kind     = "gerrit"
    name     = "UniversalLanguageSelector"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/UniversalLanguageSelector"
    ref      = WMF_EXTENSION_REF
    revision = "d33a5434bd80c3f7acb02541b9394665c84ea585"
  }
}

variable "WIKIBASECIRRUSSEARCH" {
  default = {
    kind     = "gerrit"
    name     = "WikibaseCirrusSearch"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/WikibaseCirrusSearch"
    ref      = WMF_EXTENSION_REF
    revision = "2e8b98e2434a14cd250f6ebae131853439ffdada"
  }
}

variable "WIKIBASEMANIFEST" {
  default = {
    kind     = "gerrit"
    name     = "WikibaseManifest"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/WikibaseManifest"
    ref      = WMF_EXTENSION_REF
    revision = "e5de11dcb21c2623ec4f3e5c35137e389bfe66a3"
  }
}

variable "WSOAUTH" {
  default = {
    kind     = "gerrit"
    name     = "WSOAuth"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/WSOAuth"
    ref      = WMF_EXTENSION_REF
    revision = "9ee898eb5b4f0110f9fb6ab3397b3be8ea78c5a1"
  }
}

# ==============================================================================
# Community-maintained extensions
# ==============================================================================
# Development-branch sources require the review described in UPDATING.md.

variable "WIKIBASELOCALMEDIA" {
  default = {
    kind     = "github"
    name     = "WikibaseLocalMedia"
    repo     = "https://github.com/ProfessionalWiki/WikibaseLocalMedia.git"
    ref      = "refs/heads/master"
    revision = "26795a660a2d870e7f87f29e388ca8abb9220510"
  }
}

variable "WIKIBASEEDTF" {
  default = {
    kind     = "github"
    name     = "WikibaseEdtf"
    repo     = "https://github.com/ProfessionalWiki/WikibaseEdtf.git"
    ref      = "refs/heads/master"
    revision = "3bfad88a9a71222e9ddc3df2b80f095be059b365"
  }
}

variable "WIKIBASEINWIKITEXT" {
  default = {
    kind     = "github"
    name     = "WikibaseInWikitext"
    repo     = "https://github.com/wbstack/mediawiki-extensions-WikibaseInWikitext.git"
    ref      = "refs/heads/main"
    revision = "5175dceecd2f0522b0ab9a9dae7b1bc304e359b7"
  }
}

# ==============================================================================
# Build and image-specific tags
# ==============================================================================

function "image_tags" {
  params = [tags]
  result = [for tag in tags : "${IMAGE_REPOSITORY}:${tag}"]
}

target "wikibase-base" {
  context    = "."
  dockerfile = "Dockerfile"

  args = {
    WIKIBASE_IMAGE_VERSION  = IMAGE_VERSION
    MEDIAWIKI_VERSION       = MEDIAWIKI.version
    COMPOSER_IMAGE_URL      = "${COMPOSER_IMAGE.image}:${COMPOSER_IMAGE.tag}"
    COMPOSER_IMAGE_PLATFORM = COMPOSER_IMAGE.platform
    PHP_IMAGE_URL           = "${PHP_IMAGE.image}:${PHP_IMAGE.tag}"

    WIKIBASE_COMMIT                  = WIKIBASE.revision
    BABEL_COMMIT                     = BABEL.revision
    CLDR_COMMIT                      = CLDR.revision
    CIRRUSSEARCH_COMMIT              = CIRRUSSEARCH.revision
    ELASTICA_COMMIT                  = ELASTICA.revision
    ECHO_COMMIT                      = ECHO.revision
    ENTITYSCHEMA_COMMIT              = ENTITYSCHEMA.revision
    OAUTH_COMMIT                     = OAUTH.revision
    PLUGGABLEAUTH_COMMIT             = PLUGGABLEAUTH.revision
    UNIVERSALLANGUAGESELECTOR_COMMIT = UNIVERSALLANGUAGESELECTOR.revision
    WIKIBASECIRRUSSEARCH_COMMIT      = WIKIBASECIRRUSSEARCH.revision
    WIKIBASEMANIFEST_COMMIT          = WIKIBASEMANIFEST.revision
    WSOAUTH_COMMIT                   = WSOAUTH.revision

    WIKIBASELOCALMEDIA_COMMIT = WIKIBASELOCALMEDIA.revision
    WIKIBASEEDTF_COMMIT       = WIKIBASEEDTF.revision
    WIKIBASEINWIKITEXT_COMMIT = WIKIBASEINWIKITEXT.revision
  }

  labels = {
    "org.opencontainers.image.source"  = "https://github.com/wmde/wikibase-suite"
    "org.opencontainers.image.version" = IMAGE_VERSION
  }
}

# The default developer target loads the native-platform image into Docker.
target "wikibase" {
  inherits = ["wikibase-base"]
  tags     = image_tags(TAGS)
  output   = [{ type = "docker" }]
}

# Publication remains opt-in: callers select this target and add --push.
target "wikibase-release" {
  inherits = ["wikibase-base"]
  tags = image_tags([
    IMAGE_VERSION,
    split(".", IMAGE_VERSION)[0],
    join(".", slice(split(".", IMAGE_VERSION), 0, 2)),
    "mw${MEDIAWIKI.version}"
  ])
}

group "default" {
  targets = ["wikibase"]
}
