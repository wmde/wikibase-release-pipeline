## Wikibase Bundle Docker image

Wikibase running on MediaWiki bundled with other extensions.

### Bundled extensions

- [Babel](https://www.mediawiki.org/wiki/Extension:Babel)
- [CLDR](https://www.mediawiki.org/wiki/Extension:CLDR)
- [ConfirmEdit](https://www.mediawiki.org/wiki/Extension:ConfirmEdit)
- [Elastica](https://www.mediawiki.org/wiki/Extension:Elastica), [CirrusSearch](https://www.mediawiki.org/wiki/Extension:CirrusSearch), [WikibaseCirrusSearch](https://www.mediawiki.org/wiki/Extension:WikibaseCirrusSearch)
- [EntitySchema](https://www.mediawiki.org/wiki/Extension:EntitySchema)
- [Nuke](https://www.mediawiki.org/wiki/Extension:Nuke)
- [OAuth](https://www.mediawiki.org/wiki/Extension:OAuth)
- [Scribunto](https://www.mediawiki.org/wiki/Extension:Scribunto)
- [SyntaxHighlight](https://www.mediawiki.org/wiki/Extension:SyntaxHighlight)
- [UniversalLanguageSelector](https://www.mediawiki.org/wiki/Extension:UniversalLanguageSelector)
- [VisualEditor](https://www.mediawiki.org/wiki/Extension:VisualEditor)
- [WikibaseEdtf](https://github.com/ProfessionalWiki/WikibaseEdtf)
- [WikibaseLocalMedia](https://github.com/ProfessionalWiki/WikibaseLocalMedia)
- [WikibaseManifest](https://www.mediawiki.org/wiki/Extension:WikibaseManifest)

### Environment variables

In addition to the environment variables specified for the [Wikibase Base image](../Wikibase/README.md), the follow optional variables are available in this image:

| Variable | Default | Description |
| --- | --- | --- |
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
| `/LocalSettings.php.template` | Template for MediaWiki LocalSettings.php (substituted to `/var/www/html/LocalSettings.php` at runtime) |
| `/var/www/html/LocalSettings.php` | LocalSettings.php location, when passed in `/LocalSettings.php.template` will not be used. install.php & update.php will also not be run. |
| `/default-extra-install.sh` | Script for automatically creating Elasticsearch indices and creating OAuth consumer for QuickStatements |
