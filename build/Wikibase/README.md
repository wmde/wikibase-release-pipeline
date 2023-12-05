## Wikibase Docker image

Wikibase running on Mediawiki.

### Environment variables

Variable                 | Default                   | Description
-------------------------|  -------------------------| ----------
`DB_SERVER`              | "mysql.svc:3306"          | Hostname and port for the MySQL server to use for Mediawiki & Wikibase
`DB_USER`                | "wikiuser"                | Username to use for the MySQL server
`DB_PASS`                | "sqlpass"                 | Password to use for the MySQL server
`DB_NAME`                | "my_wiki"                 | Database name to use for the MySQL server
`MW_SITE_NAME`           | "wikibase-docker"         | $wgSitename to use for MediaWiki
`MW_SITE_LANG`           | "en"                      | $wgLanguageCode to use for MediaWiki
`MW_ADMIN_NAME`          | "WikibaseAdmin"           | Admin username to create on MediaWiki first install
`MW_ADMIN_PASS`          | "WikibaseDockerAdminPass" | Admin password to use for admin account on first install
`MW_WG_SECRET_KEY`       | "secretkey"               | Used as source of entropy for persistent login/Oauth etc..
`MW_WG_ENABLE_UPLOADS`   | "false"                   | $wgEnableUploads to use for MediaWiki
`MW_WG_UPLOAD_DIRECTORY` | "/var/www/html/images"    | $wgUploadDirectory to use for MediaWiki
`MW_WG_JOB_RUN_RATE`     | "2"                       | $wgJobRunRate to use for MediaWiki
`WIKIBASE_PINGBACK`      | "false"                   | boolean for [WikibasePingback](https://doc.wikimedia.org/Wikibase/master/php/md_docs_topics_pingback.html)

### Filesystem layout

Directory                         | Description
--------------------------------- | ------------------------------------------------------------------------------
`/var/www/html`                   | Base Mediawiki directory
`/var/www/html/skins`             | Mediawiki skins directory
`/var/www/html/extensions`        | Mediawiki extensions directory
`/var/www/html/LocalSettings.d`   | LocalSettings snippet directory. All PHP files from here will be loaded at the end of the default `/LocalSettings.php.template`

File                              | Description
--------------------------------- | ------------------------------------------------------------------------------
`/LocalSettings.php.template`     | Template for Mediawiki LocalSettings.php (substituted to `/var/www/html/LocalSettings.php` at runtime)
`/var/www/html/LocalSettings.php` | LocalSettings.php location, when passed in `/LocalSettings.php.template` will not be used. install.php & update.php will also not be run.
