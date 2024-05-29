## Wikibase Suite - Wikibase Image

Wikibase running on MediaWiki bundled with extensions.

### Bundled extensions

- **[Babel](https://www.mediawiki.org/wiki/Extension:Babel)** Adds a parser function to inform other users about language proficiency and categorize users of the same levels and languages.
- **[CLDR](https://www.mediawiki.org/wiki/Extension:CLDR)** Provides functions to localize the names of languages, countries, currencies, and time units based on their language code.
- **[ConfirmEdit](https://www.mediawiki.org/wiki/Extension:ConfirmEdit)** Adds CAPTCHAs for page saves and other user actions.
- **[Elastica](https://www.mediawiki.org/wiki/Extension:Elastica)**, **[CirrusSearch](https://www.mediawiki.org/wiki/Extension:CirrusSearch)**, **[WikibaseCirrusSearch](https://www.mediawiki.org/wiki/Extension:WikibaseCirrusSearch)** ElasticSearch integration for MediaWiki and Wikibase.
- **[EntitySchema](https://www.mediawiki.org/wiki/Extension:EntitySchema)** Allows to store Shape Expression Schemas on wiki pages.
- **[Nuke](https://www.mediawiki.org/wiki/Extension:Nuke)** Gives sysops the ability to mass delete pages.
- **[OAuth](https://www.mediawiki.org/wiki/Extension:OAuth)** Allow users to safely authorize another application ("consumer") to use the MediaWiki action API on their behalf.
- **[Scribunto](https://www.mediawiki.org/wiki/Extension:Scribunto)** Provides a framework for embedding scripting languages into MediaWiki pages.
- **[SyntaxHighlight](https://www.mediawiki.org/wiki/Extension:SyntaxHighlight)** Allows source code to be syntax highlighted on wiki pages.
- **[UniversalLanguageSelector](https://www.mediawiki.org/wiki/Extension:UniversalLanguageSelector)** Tool that allows users to select a language and configure its support in an easy way.
- **[VisualEditor](https://www.mediawiki.org/wiki/Extension:VisualEditor)** Allows for editing pages as rich content.
- **[WikibaseEdtf](https://github.com/ProfessionalWiki/WikibaseEdtf)** Adds support for the Extended Date/Time Format (EDTF) Specification via a new data type.
- **[WikibaseLocalMedia](https://github.com/ProfessionalWiki/WikibaseLocalMedia)**  Adds support for local media files to Wikibase via a new data type. 
- **[WikibaseManifest](https://www.mediawiki.org/wiki/Extension:WikibaseManifest)** API provided metadata for structured data repository.

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `DB_SERVER` | undefined | Hostname and port for the MySQL server to use for MediaWiki & Wikibase |
| `DB_USER` | undefined | Username to use for the MySQL server |
| `DB_PASS` | undefined | Password to use for the MySQL server |
| `DB_NAME` | "my_wiki" | Database name to use for the MySQL server |
| `MW_ADMIN_NAME` | undefined | Admin username to create on MediaWiki first install |
| `MW_ADMIN_PASS` | undefined | Admin password to use for admin account on first install |
| `MW_WG_SERVER` | undefined | $wgServer to use for MediaWiki. A value matching how this site is accessed from the user's browser is required. |
| `MW_WG_SITENAME` | "wikibase-docker" | $wgSitename to use for MediaWiki |
| `MW_WG_LANGUAGE_CODE` | "en" | $wgLanguageCode to use for MediaWiki |
| `WIKIBASE_PINGBACK` | "false" | boolean for [WikibasePingback](https://doc.wikimedia.org/Wikibase/master/php/md_docs_topics_pingback.html) |
| `ELASTICSEARCH_HOST` | undefined | Hostname to an Elasticsearch server with the Wikibase Extension installed, if used |
| `ELASTICSEARCH_PORT` | 9200 | Port which Elasticsearch is available on|
| `QUICKSTATEMENTS_PUBLIC_URL` | undefined | Public URL of the Quickstatements server, if configured |

\* _Note: Additional functionality is installed based upon the existence of values on these variables. Do not pass values into these variables if the related services are not available._

### Filesystem layout

| Directory                       | Description                              |
| ------------------------------- | ---------------------------------------- |
| `/var/www/html`                 | Base MediaWiki directory                 |
| `/var/www/html/skins`           | MediaWiki skins directory                |
| `/var/www/html/extensions`      | MediaWiki extensions directory           |
| `/var/www/html/LocalSettings.d` | Bundle extension configuration directory |
| `/templates/`                   | Directory containing templates           |

| File | Description |
| --- | --- |
| `/default-extra-install.sh` | Script for automatically creating Elasticsearch indices and creating OAuth consumer for QuickStatements |
| `/extra-install.sh` | Optional script for custom functionality to be ran with MediaWiki install (when generating LocalSettings.php)|
| `/var/www/html/LocalSettings.wbs.php` | Wikibase specific settings appended to the MediaWiki install generated `LocalSettings.php`. In particular this loads the Wikibase repo and client extensions, and the standard set of Wikibase Suite MediaWiki extensions.

---

### JobRunner

This container doubles as MediaWiki JobRunner. To use the JobRunner, override the command to `/jobrunner-entrypoint.sh`.
