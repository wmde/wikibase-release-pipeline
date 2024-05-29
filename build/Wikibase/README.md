# Wikibase

[Wikibase](https://www.mediawiki.org/wiki/Wikibase) is a MediaWiki extension
for working with versioned semi-structured data in a central repository.

This images contains the Wikibase extension running on top of MediaWiki.
Besides Wikibase itself, several other extensions are bundles (see below). The
MediaWiki application runs on top of PHP on an Apache web server on a Debian
base image.

> 💡 This image is part of Wikibase Suite (WBS). The [WBS Deployment Toolkit](https://github.com/wmde/wikibase-release-pipeline/example/README.md) provides everything you need to self-host a Wikibase instance out of the box.

## Bundled extensions

Besides the [Wikibase extension](https://www.mediawiki.org/wiki/Wikibase), this Wikibase image contains the following set of commonly used extension:

| Extension                                                                                                                                                                                                                   | Description                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [Babel](https://www.mediawiki.org/wiki/Extension:Babel)                                                                                                                                                                     | Adds a parser function to inform other users about language proficiency and categorize users of the same levels and languages. |
| [CLDR](https://www.mediawiki.org/wiki/Extension:CLDR)                                                                                                                                                                       | Provides functions to localize the names of languages, countries, currencies, and time units based on their language code.     |
| [ConfirmEdit](https://www.mediawiki.org/wiki/Extension:ConfirmEdit)                                                                                                                                                         | Adds CAPTCHAs for page saves and other user actions.                                                                           |
| [Elastica](https://www.mediawiki.org/wiki/Extension:Elastica), [CirrusSearch](https://www.mediawiki.org/wiki/Extension:CirrusSearch), [WikibaseCirrusSearch](https://www.mediawiki.org/wiki/Extension:WikibaseCirrusSearch) | ElasticSearch integration for MediaWiki and Wikibase.                                                                          |
| [EntitySchema](https://www.mediawiki.org/wiki/Extension:EntitySchema)                                                                                                                                                       | Allows to store Shape Expression Schemas on wiki pages.                                                                        |
| [Nuke](https://www.mediawiki.org/wiki/Extension:Nuke)                                                                                                                                                                       | Gives sysops the ability to mass delete pages.                                                                                 |
| [OAuth](https://www.mediawiki.org/wiki/Extension:OAuth)                                                                                                                                                                     | Allow users to safely authorize another application ("consumer") to use the MediaWiki action API on their behalf.              |
| [Scribunto](https://www.mediawiki.org/wiki/Extension:Scribunto)                                                                                                                                                             | Provides a framework for embedding scripting languages into MediaWiki pages.                                                   |
| [SyntaxHighlight](https://www.mediawiki.org/wiki/Extension:SyntaxHighlight)                                                                                                                                                 | Allows source code to be syntax highlighted on wiki pages.                                                                     |
| [UniversalLanguageSelector](https://www.mediawiki.org/wiki/Extension:UniversalLanguageSelector)                                                                                                                             | Tool that allows users to select a language and configure its support in an easy way.                                          |
| [VisualEditor](https://www.mediawiki.org/wiki/Extension:VisualEditor)                                                                                                                                                       | Allows for editing pages as rich content.                                                                                      |
| [WikibaseEdtf](https://github.com/ProfessionalWiki/WikibaseEdtf)                                                                                                                                                            | Adds support for the Extended Date/Time Format (EDTF) Specification via a new data type.                                       |
| [WikibaseLocalMedia](https://github.com/ProfessionalWiki/WikibaseLocalMedia)                                                                                                                                                | Adds support for local media files to Wikibase via a new data type.                                                            |
| [WikibaseManifest](https://www.mediawiki.org/wiki/Extension:WikibaseManifest)                                                                                                                                               | API provided metadata for structured data repository.                                                                          |

## Requirements

In order to run Wikibase, you need:

- a database
- a configuration volume
- initial settings through environment variables
- job runner

### Database

The database MediaWiki will connect to and store all its data in. Technically,
MediaWiki supports multiple database engines. Though, MariaDB is the most
commonly used. This is also the only engine used to test the image before
release.

### Config Volume

MediaWiki will generate a `LocalSettings.php` file on first launch. This file
needs to be maintained by you, as you own it after generation. The Config
Volume is the place where this file will be stored.

### Environment variables for initial settings

Those variables are only respected on first launch for generating
MediaWikis `LocalSettings.php` file. When launching the image with a
`LocalSettings.php` file present in the Config Volume, environment variables
will not be taken into account.

Variables in **bold** are required on first launch without `LocalSettings.php`
in the Config Volume. The image will fail to start if one of those variables
does not have a value. Default values do not need to be overwritten.

| Variable                     | Default          | Description                                                                                                                                                                                                  |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`DB_SERVER`**              | undefined        | Hostname and port for the MySQL server to use for MediaWiki & Wikibase                                                                                                                                       |
| **`DB_USER`**                | undefined        | Username to use for the MySQL server                                                                                                                                                                         |
| **`DB_PASS`**                | undefined        | Password to use for the MySQL server                                                                                                                                                                         |
| **`DB_NAME`**                | "my_wiki"        | Database name to use for the MySQL server                                                                                                                                                                    |
| **`MW_ADMIN_NAME`**          | undefined        | Admin username to create on MediaWiki first install                                                                                                                                                          |
| **`MW_ADMIN_PASS`**          | undefined        | Admin password to use for admin account on first install                                                                                                                                                     |
| **`MW_ADMIN_EMAIL`**         | undefined        | Admin password to use for admin account on first install                                                                                                                                                     |
| **`MW_WG_SERVER`**           | undefined        | $wgServer to use for MediaWiki. A value matching how this site is accessed from the user's browser is required.                                                                                              |
| **`MW_WG_SITENAME`**         | "wikibase-suite" | $wgSitename to use for MediaWiki                                                                                                                                                                             |
| **`MW_WG_LANGUAGE_CODE`**    | "en"             | $wgLanguageCode to use for MediaWiki                                                                                                                                                                         |
| `ELASTICSEARCH_HOST`         | undefined        | Hostname to an Elasticsearch server with the Wikibase Extension installed, such as [wikibase/elasticsearch](https://hub.docker.com/r/wikibase/elasticsearch). Leave this undefined to disable ElasticSearch. |
| `ELASTICSEARCH_PORT`         | 9200             | Port which Elasticsearch is available on                                                                                                                                                                     |
| `QUICKSTATEMENTS_PUBLIC_URL` | undefined        | Public URL of the Quickstatements server, such as [wikibase/quickstatements](https://hub.docker.com/r/wikibase/quickstatements). Leave undefined to disable QuickStatements functionality.                   |

### Job Runner
MediaWiki/Wikibase depends on [jobs being run in the background](https://www.mediawiki.org/wiki/Manual:Job_queue). 
This can be either done on HTTP request, or by a dedicated Job Runner. The
default configuration of this image requires such an external Job Runner.

To setup an external Job Runner, use this image for a second container,
overwrite the command to `/jobrunner-entrypoint.sh` and share the same Config
Volume with it.

### Example `docker-compose.yml`

An example setup to run this image on [http://localhost](http://localhost) using Docker Compose could look like this:

```yml
services:
  wikibase:
    image: wikibase/wikibase
    ports:
      - 80:80
    volumes:
      - ./config:/config
      - wikibase-image-data:/var/www/html/images
    environment:
      MW_ADMIN_NAME: "admin"
      MW_ADMIN_PASS: "change-this-password"
      MW_ADMIN_EMAIL: "admin@mydomain.net"
      MW_WG_SERVER: http://localhost
      DB_SERVER: mysql:3306
      DB_NAME: "my_wiki"
      DB_USER: "mariadb-user"
      DB_PASS: "change-this-password"
    healthcheck:
      test: curl --silent --fail localhost/wiki/Main_Page
      interval: 10s
      start_period: 5m
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped

  wikibase-jobrunner:
    image: wikibase/wikibase
    command: /jobrunner-entrypoint.sh
    depends_on:
      wikibase:
        condition: service_healthy
    restart: always
    volumes_from:
      - wikibase

  mysql:
    image: mariadb:10.11
    volumes:
      - mysql-data:/var/lib/mysql
    environment:
      MYSQL_DATABASE: "my_wiki"
      MYSQL_USER: "mariadb-user"
      MYSQL_PASSWORD: "change-this-password"
      MYSQL_RANDOM_ROOT_PASSWORD: yes
    healthcheck:
      test: healthcheck.sh --connect --innodb_initialized
      start_period: 1m
      interval: 20s
      timeout: 5s
    restart: unless-stopped

volumes:
  wikibase-image-data:
  mysql-data:
```

## Versioning

## Filesystem layout

| Directory                       | Description                              |
| ------------------------------- | ---------------------------------------- |
| `/var/www/html`                 | Base MediaWiki directory                 |
| `/var/www/html/skins`           | MediaWiki skins directory                |
| `/var/www/html/extensions`      | MediaWiki extensions directory           |
| `/var/www/html/LocalSettings.d` | Bundle extension configuration directory |
| `/templates/`                   | Directory containing templates           |

| File                                  | Description                                                                                                                                                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/default-extra-install.sh`           | Script for automatically creating Elasticsearch indices and creating OAuth consumer for QuickStatements                                                                                                                    |
| `/extra-install.sh`                   | Optional script for custom functionality to be ran with MediaWiki install (when generating LocalSettings.php)                                                                                                              |
| `/var/www/html/LocalSettings.wbs.php` | Wikibase specific settings appended to the MediaWiki install generated `LocalSettings.php`. In particular this loads the Wikibase repo and client extensions, and the standard set of Wikibase Suite MediaWiki extensions. |

---

## JobRunner

This container doubles as MediaWiki JobRunner. To use the JobRunner, override the command to `/jobrunner-entrypoint.sh`.
