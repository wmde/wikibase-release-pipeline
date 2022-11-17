## WDQS Docker image

Wikibase specific Blazegraph image.

### Security

[WDQS](https://gerrit.wikimedia.org/r/admin/repos/wikidata/query/rdf) exposes by default some endpoints and methods that reveal internal details or functionality that might allow for abuse of the system. With the example docker configuration we are using the [WDQS-proxy](../WDQS-proxy/README.md) which filters out all long-running or unwanted requests.

When running WDQS in a setup without WDQS-proxy **please consider disabling these endpoints in some other way**. For more information on how this is tested in this pipeline see the test-cases in [queryservice.js](../../test/selenium/specs/repo/queryservice.js)

### Upgrading

When upgrading between WDQS versions the data stored in `/wdqs/data` may not be compatible with the newer version.
When testing the new image if no data appears to be loaded into the Query Service you will need to reload the data.

If all changes are still in [RecentChanges] then simply removing `/wdqs/data` and restarting the service should reload all data.

[RecentChanges] are however periodically purged with anything older determined by the mediawiki configuration [\$wgRCMaxAge](https://www.mediawiki.org/wiki/Manual:$wgRCMaxAge).

If you can not use [RecentChanges] then you will need to reload from an RDF dump:

 - [Make an RDF dump from your Wikibase repository using the dumpRdf.php maintenance script.](https://doc.wikimedia.org/Wikibase/master/php/docs_topics_rdf-binding.html)
 - [Load the RDF dump into the query service](https://github.com/wikimedia/wikidata-query-rdf/blob/master/docs/getting-started.md#load-the-dump)

### Environment variables

Variable                 | Default            | Since   | Description
-------------------------|  ------------------| --------| ----------
`MEMORY`                 | ""                 | 0.2.5   | Memory limit for Blazegraph
`HEAP_SIZE`              | "1g"               | 0.2.5   | Heap size for Blazegraph
`WIKIBASE_HOST`          | "wikibase.svc"     | 0.2.5   | Hostname of the Wikibase host
`WIKIBASE_SCHEME`        | "http"             | 0.2.5   | Scheme of the Wikibase host
`WDQS_HOST`              | "wdqs.svc"         | 0.2.5   | Hostname of the WDQS host (this service)
`WDQS_PORT`              | "9999"             | 0.2.5   | Port of the WDQS host (this service)
`WDQS_ENTITY_NAMESPACES` | "120,122"          | 0.2.5   | Wikibase Namespaces to load data from
`WIKIBASE_MAX_DAYS_BACK` | "90"               | 0.3.0   | Max days updater is allowed back from now
`BLAZEGRAPH_EXTRA_OPTS`  | ""                 | wmde.9  | Extra options to be passed to Blazegraph

Note on `BLAZEGRAPH_EXTRA_OPTS`: These are options that are directly passed to the Blazegraph jar. That means they must be prefixed with `-D`. Example: `-Dhttps.proxyHost=http://my.proxy.com -Dhttps.proxyPort=3128`. See [the Wikidata Query Service User Manual](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual#Configurable_properties) for all available options.

### Filesystem layout

File                              | Description
--------------------------------- | ------------------------------------------------------------------------------
`/wdqs/whitelist.txt`             | SPARQL endpoints that are allowed for federation
`/wdqs/RWStore.properties`        | Properties for the service
`/templates/mwservices.json`      | Template for MediaWiki services (substituted to `/wdqs/mwservices.json` at runtime)

### Troubleshooting

The image requires more than 2GB of available RAM to start.

### Development

New releases that are available for images to be created can be found on Archiva: https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/

When creating a new image RWStore.properties might need to be updated to match the properties used in Wikidata production.

For this reason it is easier to create new releases for WDQS versions that have been tested in Wikidata production.

When creating a new release the WMF Search platform team can be contacted for help syncing the wdqs version and RWStore.properties file.

[RecentChanges]: https://www.mediawiki.org/wiki/API:RecentChanges
