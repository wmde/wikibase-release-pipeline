# Wikibase image manifest
#
# Image-specific source, build, metadata, and tagging configuration lives here.
# Builder, cache, output, and target-platform policy is supplied by wbs-dev or
# additional Bake files.

variable "IMAGE_NAME" {
  default = "wikibase"
}

variable "IMAGE_VERSION" {
  default = "8.0.0"

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
    revision = "beac6f2208f9ccd824e7ddbe0c5cf79445f71df1"
  }
}

variable "BABEL" {
  default = {
    kind     = "gerrit"
    name     = "Babel"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/Babel"
    ref      = WMF_EXTENSION_REF
    revision = "921d538763ed4bc084519f41fad4d7306c979fbd"
  }
}

variable "CLDR" {
  default = {
    kind     = "gerrit"
    name     = "cldr"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/cldr"
    ref      = WMF_EXTENSION_REF
    revision = "b65931db807edfe24238830d75c0bec0825d4e10"
  }
}

variable "CIRRUSSEARCH" {
  default = {
    kind     = "gerrit"
    name     = "CirrusSearch"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/CirrusSearch"
    ref      = WMF_EXTENSION_REF
    revision = "4bd99abfc1f9f8b50c8eb24b68c296afbd57e9c4"
  }
}

variable "ELASTICA" {
  default = {
    kind     = "gerrit"
    name     = "Elastica"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/Elastica"
    ref      = WMF_EXTENSION_REF
    revision = "b03db3803b4af48c092462c8872ffa38f6d0fe8a"
  }
}

variable "ECHO" {
  default = {
    kind     = "gerrit"
    name     = "Echo"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/Echo"
    ref      = WMF_EXTENSION_REF
    revision = "6b3af80c5052a338ae947f1aec1935c87d1f7bae"
  }
}

variable "ENTITYSCHEMA" {
  default = {
    kind     = "gerrit"
    name     = "EntitySchema"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/EntitySchema"
    ref      = WMF_EXTENSION_REF
    revision = "bbf6d21dd67bb96fc628040295c0ca276a2e8d93"
  }
}

variable "OAUTH" {
  default = {
    kind     = "gerrit"
    name     = "OAuth"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/OAuth"
    ref      = WMF_EXTENSION_REF
    revision = "4f0532740ba691103a6e697f9d1a8d860ee97ddf"
  }
}

variable "PLUGGABLEAUTH" {
  default = {
    kind     = "gerrit"
    name     = "PluggableAuth"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/PluggableAuth"
    ref      = WMF_EXTENSION_REF
    revision = "b5b4d2fd44a653e4a2c4ab56c6e6c1b948d43bac"
  }
}

variable "UNIVERSALLANGUAGESELECTOR" {
  default = {
    kind     = "gerrit"
    name     = "UniversalLanguageSelector"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/UniversalLanguageSelector"
    ref      = WMF_EXTENSION_REF
    revision = "62f29f154efc8f79f33c2b1a0bc4a81a6786db5f"
  }
}

variable "WIKIBASECIRRUSSEARCH" {
  default = {
    kind     = "gerrit"
    name     = "WikibaseCirrusSearch"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/WikibaseCirrusSearch"
    ref      = WMF_EXTENSION_REF
    revision = "be1b8cbaf6abe37278b01d5d36ebe02e5d7f0e0f"
  }
}

variable "WIKIBASEMANIFEST" {
  default = {
    kind     = "gerrit"
    name     = "WikibaseManifest"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/WikibaseManifest"
    ref      = WMF_EXTENSION_REF
    revision = "8290c98d766d8d52a7e7ec0fe1ce3a2d6cd76731"
  }
}

variable "WSOAUTH" {
  default = {
    kind     = "gerrit"
    name     = "WSOAuth"
    repo     = "https://gerrit.wikimedia.org/r/mediawiki/extensions/WSOAuth"
    ref      = WMF_EXTENSION_REF
    revision = "cefce57e41c87ecadd744ace75fefa5311ffa5cf"
  }
}

variable "REVISIONSLIDER" {
  default = {
    kind = "gerrit", name = "RevisionSlider", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/RevisionSlider"
    ref = WMF_EXTENSION_REF, revision = "bcf88506161d57001b523bf9c2ff3a03cf565255"
  }
}

variable "TORBLOCK" {
  default = {
    kind = "gerrit", name = "TorBlock", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/TorBlock"
    ref = WMF_EXTENSION_REF, revision = "7a34e88517b1bd70856b299aec7563eb9091606b"
  }
}

variable "JSONCONFIG" {
  default = {
    kind = "gerrit", name = "JsonConfig", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/JsonConfig"
    ref = WMF_EXTENSION_REF, revision = "f9015ed89d7aedeb6c5d18fed6b58bb598a7dc20"
  }
}

variable "KARTOGRAPHER" {
  default = {
    kind = "gerrit", name = "Kartographer", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/Kartographer"
    ref = WMF_EXTENSION_REF, revision = "634b552f6f5d3c47dd9413dde00d81e0efcb4c81"
  }
}

variable "TEMPLATESANDBOX" {
  default = {
    kind = "gerrit", name = "TemplateSandbox", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/TemplateSandbox"
    ref = WMF_EXTENSION_REF, revision = "7fd76b37e6d85418ff082ab8127cf1c51c7fa466"
  }
}

variable "CODEMIRROR" {
  default = {
    kind = "gerrit", name = "CodeMirror", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/CodeMirror"
    ref = WMF_EXTENSION_REF, revision = "31801f4f592c30786a8845b4503855860b41be81"
  }
}

variable "ADVANCEDSEARCH" {
  default = {
    kind = "gerrit", name = "AdvancedSearch", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/AdvancedSearch"
    ref = WMF_EXTENSION_REF, revision = "23ae0b9718b368673ac86fbc86d0c701a54b48fa"
  }
}

variable "TWOCOLCONFLICT" {
  default = {
    kind = "gerrit", name = "TwoColConflict", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/TwoColConflict"
    ref = WMF_EXTENSION_REF, revision = "d4c4742626c2bec7720b5552c1e8d853fdc37f71"
  }
}

variable "STOPFORUMSPAM" {
  default = {
    kind = "gerrit", name = "StopForumSpam", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/StopForumSpam"
    ref = WMF_EXTENSION_REF, revision = "b133d7b9f3822b217d0b396359aa931e5a7497d3"
  }
}

variable "MOBILEFRONTEND" {
  default = {
    kind = "gerrit", name = "MobileFrontend", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/MobileFrontend"
    ref = WMF_EXTENSION_REF, revision = "e00881d4d6f2e91f57026e8fa81a7dd8ad71cda4"
  }
}

variable "CONFIRMACCOUNT" {
  default = {
    kind = "gerrit", name = "ConfirmAccount", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/ConfirmAccount"
    ref = WMF_EXTENSION_REF, revision = "a3227fdc9413ec8c3b50d671ee389a72d818257b"
  }
}

variable "INVITESIGNUP" {
  default = {
    kind = "gerrit", name = "InviteSignup", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/InviteSignup"
    ref = WMF_EXTENSION_REF, revision = "07463e8d97370a36bc8ef47153c818ef9e3b7cd3"
  }
}

variable "WIKIBASELEXEME" {
  default = {
    kind = "gerrit", name = "WikibaseLexeme", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/WikibaseLexeme"
    ref = WMF_EXTENSION_REF, revision = "f71760e895a3b0793a946f976bd5783409f87536"
  }
}

variable "WIKIBASELEXEMECIRRUSSEARCH" {
  default = {
    kind = "gerrit", name = "WikibaseLexemeCirrusSearch", repo = "https://gerrit.wikimedia.org/r/mediawiki/extensions/WikibaseLexemeCirrusSearch"
    ref = WMF_EXTENSION_REF, revision = "3fbbbe32baac83146a1ff3f939e2631dc12de708"
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
    revision = "ddc6c87292429b662644cdc7c24402b12336377a"
  }
}

variable "WIKIBASEEDTF" {
  default = {
    kind     = "github"
    name     = "WikibaseEdtf"
    repo     = "https://github.com/ProfessionalWiki/WikibaseEdtf.git"
    ref      = "refs/heads/master"
    revision = "e94c2fcdbcb91124978ac20f6d912d8cdd2ecaae"
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

variable "WIKIHIERO" {
  default = {
    kind     = "github"
    name     = "WikiHiero"
    repo     = "https://github.com/wikimedia/mediawiki-extensions-WikiHiero.git"
    ref      = WMF_EXTENSION_REF
    revision = "d3a78de14f7869286032a10a6736e57ca5855e98"
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
    REVISIONSLIDER_COMMIT            = REVISIONSLIDER.revision
    TORBLOCK_COMMIT                  = TORBLOCK.revision
    JSONCONFIG_COMMIT                = JSONCONFIG.revision
    KARTOGRAPHER_COMMIT              = KARTOGRAPHER.revision
    TEMPLATESANDBOX_COMMIT           = TEMPLATESANDBOX.revision
    CODEMIRROR_COMMIT                = CODEMIRROR.revision
    ADVANCEDSEARCH_COMMIT            = ADVANCEDSEARCH.revision
    TWOCOLCONFLICT_COMMIT            = TWOCOLCONFLICT.revision
    STOPFORUMSPAM_COMMIT             = STOPFORUMSPAM.revision
    MOBILEFRONTEND_COMMIT            = MOBILEFRONTEND.revision
    CONFIRMACCOUNT_COMMIT            = CONFIRMACCOUNT.revision
    INVITESIGNUP_COMMIT              = INVITESIGNUP.revision
    WIKIBASELEXEME_COMMIT            = WIKIBASELEXEME.revision
    WIKIBASELEXEMECIRRUSSEARCH_COMMIT = WIKIBASELEXEMECIRRUSSEARCH.revision

    WIKIBASELOCALMEDIA_COMMIT = WIKIBASELOCALMEDIA.revision
    WIKIBASEEDTF_COMMIT       = WIKIBASEEDTF.revision
    WIKIBASEINWIKITEXT_COMMIT = WIKIBASEINWIKITEXT.revision
    WIKIHIERO_COMMIT           = WIKIHIERO.revision
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
