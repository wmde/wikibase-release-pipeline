## Wikibase Bundle Docker image

Wikibase running on Mediawiki bundled with other extensions.

### Bundled extensions

- [Babel](https://www.mediawiki.org/wiki/Extension:Babel)
- [CLDR](https://www.mediawiki.org/wiki/Extension:CLDR)
- [ConfirmEdit](https://www.mediawiki.org/wiki/Extension:ConfirmEdit)
- [Elastica](https://www.mediawiki.org/wiki/Extension:Elastica), [CirrusSearch](https://www.mediawiki.org/wiki/Extension:CirrusSearch), [WikibaseCirrusSearch](https://www.mediawiki.org/wiki/Extension:WikibaseCirrusSearch)
- [EntitySchema](https://www.mediawiki.org/wiki/Extension:EntitySchema)
- [Nuke](https://www.mediawiki.org/wiki/Extension:Nuke)
- [OAuth](https://www.mediawiki.org/wiki/Extension:OAuth)
- [Scribunto](https://www.mediawiki.org/wiki/Extension:Scribunto)
- [UniversalLanguageSelector](https://www.mediawiki.org/wiki/Extension:UniversalLanguageSelector)
- [VisualEditor](https://www.mediawiki.org/wiki/Extension:VisualEditor)
- [WikibaseLocalMedia](https://github.com/ProfessionalWiki/WikibaseLocalMedia)
- [WikibaseManifest](https://www.mediawiki.org/wiki/Extension:WikibaseManifest)

### Environment variables

see [base image](../Wikibase/README.md)

### Filesystem layout

Directory                             | Description
--------------------------------------|-------------------------------------------------------------------------------
`/var/www/html`                       | Base Mediawiki directory
`/var/www/html/skins`                 | Mediawiki skins directory
`/var/www/html/extensions`            | Mediawiki extensions directory
`/var/www/html/LocalSettings.d`       | Bundle extension configuration directory
`/extra-install`                      | Extra install scripts for automatic setup
`/templates/`                         | Directory containing templates

File                                  | Description
--------------------------------------|-------------------------------------------------------------------------------
`/LocalSettings.php.template`         | Template for Mediawiki LocalSettings.php (substituted to `/var/www/html/LocalSettings.php` at runtime)
`/var/www/html/LocalSettings.php`     | LocalSettings.php location, when passed in `/LocalSettings.php.template` will not be used. install.php & update.php will also not be run.
`/extra-install/ElasticSearch.sh`     | Script for automatically creating Elasticsearch indices
`/extra-install/QuickStatements.sh`   | Script for automatically creating OAuth consumer for Quick Statements
