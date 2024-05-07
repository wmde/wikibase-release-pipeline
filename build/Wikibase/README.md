## Wikibase Docker image

Wikibase running on MediaWiki.

### Environment variables (setup / first run only)

| Variable | Default | Description |
| --- | --- | --- |
| `DB_SERVER` | undefined | Hostname and port for the MySQL server to use for MediaWiki & Wikibase |
| `DB_USER` | undefined | Username to use for the MySQL server |
| `DB_PASS` | undefined | Password to use for the MySQL server |
| `DB_NAME` | "my_wiki" | Database name to use for the MySQL server |
| `MW_ADMIN_NAME` | undefined | Admin username to create on MediaWiki first install |
| `MW_ADMIN_PASS` | undefined | Admin password to use for admin account on first install |

### Environment variables

| `MW_WG_SERVER` | undefined | $wgServer to use for MediaWiki. A value matching how this site is accessed from the user's browser is required. |
| `MW_WG_SITENAME` | "wikibase-docker" | $wgSitename to use for MediaWiki |
| `MW_WG_LANGUAGE_CODE` | "en" | $wgLanguageCode to use for MediaWiki |
| `WIKIBASE_PINGBACK` | "false" | boolean for [WikibasePingback](https://doc.wikimedia.org/Wikibase/master/php/md_docs_topics_pingback.html) |

### Filesystem layout

| Directory | Description |
| --- | --- |
| `/var/www/html` | Base MediaWiki directory |
| `/var/www/html/skins` | MediaWiki skins directory |
| `/var/www/html/extensions` | MediaWiki extensions directory |
| `/var/www/html/LocalSettings.d` | LocalSettings snippet directory. All PHP files from here will be loaded in alphabetical order at the end of other install generated settings |

| File | Description |
| --- | --- |
| `/var/www/html/LocalSettings.wbs-extensions.php` | Wikibase specific settings appended to the MediaWiki install generated `LocalSettings.php`. In particular this loads the Wikibase repo and client extensions, and the standard set of Wikibase Suite MediaWiki extensions.

### JobRunner

This container doubles as MediaWiki JobRunner. To use the JobRunner, override the command to `/jobrunner-entrypoint.sh`.
