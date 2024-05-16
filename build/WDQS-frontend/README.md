## WDQS-Frontend Docker image

Frontend for the Wikibase Query Service, as seen at [https://query.wikidata.org](https://query.wikidata.org) for Wikidata.

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `LANGUAGE` | "en" | Language to use in the UI |
| `BRAND_TITLE` | "DockerWikibaseQueryService" | Name to display on the UI |
| `WIKIBASE_HOST` | "wikibase" | Hostname of the Wikibase host (required) |
| `WDQS_HOST` | "wdqs" | Hostname of the WDQS host |
| `WDQS_PORT` | "9999" | Port of the WDQS host |
| `COPYRIGHT_URL` | "undefined" | URL for the copyright notice |
