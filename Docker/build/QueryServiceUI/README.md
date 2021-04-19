## WDQS-Frontend Docker image

Frontend for the Wikibase Query Service, as seen at [https://query.wikidata.org](https://query.wikidata.org) for Wikidata.

### Environment variables

Variable          | Default                      | Description
------------------|  ----------------------------| ----------
`LANGUAGE`        | "en"                         | Language to use in the UI
`BRAND_TITLE`     | "DockerWikibaseQueryService" | Name to display on the UI
`WIKIBASE_HOST`   | "wikibase.svc"               | Hostname of the Wikibase host
`WDQS_HOST`       | "wdqs-proxy.svc"             | Hostname of the WDQS host (probably READONLY, hence use of the wdqs-proxy service)
`COPYRIGHT_URL`   | "undefined"                  | URL for the copyright notice
