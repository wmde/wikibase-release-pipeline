# Internal filesystem layout

Hooking into the internal filesystem can extend the functionality of this image.

| Directory                       | Description                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `/var/www/html`                 | Base MediaWiki directory                                                                                       |
| `/var/www/html/images`          | MediaWiki image and media upload directory                                                                     |
| `/var/www/html/skins`           | MediaWiki skins directory                                                                                      |
| `/var/www/html/extensions`      | MediaWiki extensions directory                                                                                 |
| `/var/www/html/LocalSettings.d` | MediaWiki LocalSettings configuration directory, sourced in alphabetical order at the end of LocalSettings.php |
| `/templates/`                   | Directory containing templates                                                                                 |

| File                               | Description                                                                                                                                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/default-extra-install.sh`        | Script for automatically creating Elasticsearch indices and creating OAuth consumer for QuickStatements                                                                                        |
| `/extra-install.sh`                | Optional script for custom functionality to be ran with MediaWiki install (when generating LocalSettings.php)                                                                                  |
| `/templates/LocalSettings.wbs.php` | Wikibase-specific settings appended to the MediaWiki install generated `LocalSettings.php`. Specifically, this loads the Wikibase repo and client as well as all the other bundled extensions. |

