# Wikibase Suite 7 upgrade fixture

`LocalSettings.php` and `database.sql.gz` come from a fresh Wikibase Suite 7.1.0
installation running MediaWiki 1.45.4. Credentials and secrets are test values.
The configuration includes a few changed generated settings and custom settings
on both sides of the generated extension-loading boundary.

The database fixture contains the fresh installation's schema and data. Rows
from MediaWiki's derived `l10n_cache` are omitted; its empty schema is retained.
