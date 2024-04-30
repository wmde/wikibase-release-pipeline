## Wikibase Docker image

Wikibase running on MediaWiki.

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `SETUP_DB_SERVER` | "mysql:3306" | Hostname and port for the MySQL server to use for MediaWiki & Wikibase |
| `SETUP_DB_USER` | "wikiuser" | Username to use for the MySQL server |
| `SETUP_DB_PASS` | "sqlpass" | Password to use for the MySQL server |
| `SETUP_DB_NAME` | "my_wiki" | Database name to use for the MySQL server |
| `SETUP_MW_ADMIN_NAME` | "Admin" | Admin username to create on MediaWiki first install |
| `SETUP_MW_ADMIN_PASS` | "change-this-password" | Admin password to use for admin account on first install |
| `MW_WG_SITENAME` | "wikibase-docker" | $wgSitename to use for MediaWiki |
| `MW_WG_LANGUAGE_CODE` | "en" | $wgLanguageCode to use for MediaWiki |
| `MW_WG_ENABLE_UPLOADS` | "false" | $wgEnableUploads to use for MediaWiki |
| `MW_WG_JOB_RUN_RATE` | "0" | $wgJobRunRate to use for MediaWiki. Defaults to 0 as a Job Runner instance is assumed, set to > 0 if a Job Runner is not used |
| `WIKIBASE_PINGBACK` | "false" | boolean for [WikibasePingback](https://doc.wikimedia.org/Wikibase/master/php/md_docs_topics_pingback.html) |

### Filesystem layout

| Directory | Description |
| --- | --- |
| `/var/www/html` | Base MediaWiki directory |
| `/var/www/html/skins` | MediaWiki skins directory |
| `/var/www/html/extensions` | MediaWiki extensions directory |
| `/var/www/html/LocalSettings.d` | LocalSettings snippet directory. All PHP files from here will be loaded at the end of other install generated settings, but before the settings in `/config/LocalSettings.override.php`

| File | Description |
| --- | --- |
| `/var/www/html/LocalSettings.wikibase.php` | Wikibase specific settings appended to the MediaWiki install generated `LocalSettings.php`

### JobRunner

This container doubles as MediaWiki JobRunner. To use the JobRunner, override the command to `/jobrunner-entrypoint.sh`.
