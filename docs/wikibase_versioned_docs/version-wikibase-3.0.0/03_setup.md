# Setup

In order to run Wikibase, you need:

- Database
- Configuration volume
- Initial settings via environment variables
- Job runner

## Database

This is the database MediaWiki will connect to and store all its data in. Technically, MediaWiki supports multiple database engines, but MariaDB is the most commonly used. This is also the only engine used to test the image before release.

## Configuration volume

MediaWiki will generate a `LocalSettings.php` file on first launch. Once this file has been generated, you own and control it. This file is stored in the configuration volume.

## Environment variables for initial settings

These variables are only respected on first launch in order to generate MediaWiki's `LocalSettings.php` file. When launching the image with a `LocalSettings.php` file present in the configuration volume, environment variables will not be taken into account.

Variables in **bold** are required on first launch without `LocalSettings.php` in the configuration volume. The image will fail to start if one of those variables does not have a value. Default values do not need to be overwritten.

| Variable                     | Default    | Description                                                                                                                                                                                                  |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`DB_SERVER`**              | undefined  | Hostname and port for the MySQL server to use for MediaWiki & Wikibase                                                                                                                                       |
| **`DB_USER`**                | undefined  | Username to use for the MySQL server                                                                                                                                                                         |
| **`DB_PASS`**                | undefined  | Password to use for the MySQL server                                                                                                                                                                         |
| **`DB_NAME`**                | "my_wiki"  | Database name to use for the MySQL server                                                                                                                                                                    |
| **`MW_ADMIN_NAME`**          | undefined  | Admin username to create on MediaWiki first install                                                                                                                                                          |
| **`MW_ADMIN_PASS`**          | undefined  | Admin password to use for admin account on first install                                                                                                                                                     |
| **`MW_ADMIN_EMAIL`**         | undefined  | Admin password to use for admin account on first install                                                                                                                                                     |
| **`MW_WG_SERVER`**           | undefined  | `$wgServer` to use for MediaWiki. A value matching how this site is accessed from the user's browser is required.                                                                                              |
| **`MW_WG_SITENAME`**         | "wikibase" | `$wgSitename` to use for MediaWiki                                                                                                                                                                             |
| **`MW_WG_LANGUAGE_CODE`**    | "en"       | `$wgLanguageCode` to use for MediaWiki                                                                                                                                                                         |
| `ELASTICSEARCH_HOST`         | undefined  | Hostname of an Elasticsearch server with the Wikibase extension installed, such as [wikibase/elasticsearch](https://hub.docker.com/r/wikibase/elasticsearch). Leave this undefined to disable Elasticsearch. |
| `ELASTICSEARCH_PORT`         | 9200       | Port on which Elasticsearch is available                                                                                                                                                                     |
| `QUICKSTATEMENTS_PUBLIC_URL` | undefined  | Public URL of the QuickStatements server, such as [wikibase/quickstatements](https://hub.docker.com/r/wikibase/quickstatements). Leave undefined to disable QuickStatements functionality.                   |

## Job runner

MediaWiki/Wikibase depends on [jobs being run in the background](https://www.mediawiki.org/wiki/Manual:Job_queue). This can be either done on HTTP request or by a dedicated job runner. The default configuration of this image requires an external job runner like this.

To set up an external job runner, use this image for a second container, overwrite the command to `/jobrunner-entrypoint.sh` and share the same configuration volume with it.

