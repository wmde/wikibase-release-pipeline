## WDQS Docker image

Wikibase-specific Blazegraph image.

### Security

By default, [WDQS](https://gerrit.wikimedia.org/r/admin/repos/wikidata/query/rdf) exposes some endpoints and methods that reveal internal details or functionality that might allow for abuse of the system. With the Wikibase Suite Deployment Kit configuration, we're using the [WDQS-proxy](../WDQS-proxy/README.md) which filters out all long-running or unwanted requests.

When running WDQS in a setup without WDQS-proxy, **please consider disabling these endpoints in some other way**. For more information on how this is tested in the pipeline, see the test cases in [queryservice.ts](../../test/specs/repo/queryservice.ts)

### Upgrading

When upgrading between WDQS versions, the data stored in `/wdqs/data` may not be compatible with the newer version. When testing the new image, if no data appears to have been loaded into the Query Service, you'll need to reload the data.

If all changes still appear in [RecentChanges], simply removing `/wdqs/data` and restarting the service should reload all data.

However, [RecentChanges] are periodically purged of older entries, as determined by the MediaWiki configuration [\$wgRCMaxAge](https://www.mediawiki.org/wiki/Manual:$wgRCMaxAge).

If you can't use [RecentChanges], you'll need to reload from an RDF dump:

- [Make an RDF dump from your Wikibase repository using the dumpRdf.php maintenance script.](https://doc.wikimedia.org/Wikibase/master/php/docs_topics_rdf-binding.html)
- [Load the RDF dump into the query service](https://github.com/wikimedia/wikidata-query-rdf/blob/master/docs/getting-started.md#load-the-dump)

### Environment variables

| Variable | Default | Since | Description |
| --- | --- | --- | --- |
| `WIKIBASE_HOST` | "wikibase" | 0.2.5 | Hostname of the Wikibase service |
| `WIKIBASE_SCHEME` | "http" | 0.2.5 | URL scheme of the Wikibase service |
| `WDQS_HOST` | "wdqs" | 0.2.5 | WDQS hostname (this service) |
| `WDQS_PORT` | "9999" | 0.2.5 | WDQS port (this service) |
| `WDQS_ENTITY_NAMESPACES` | "120,122" | 0.2.5 | Wikibase namespaces to load data from |
| `WIKIBASE_MAX_DAYS_BACK` | "90" | 0.3.0 | Maximum number of days updater can reach back in time from now |
| `BLAZEGRAPH_EXTRA_OPTS` | "" | wmde.9 | Extra options to be passed to Blazegraph |
| `MEMORY` | "" | 0.2.5 | Memory limit for Blazegraph |
| `HEAP_SIZE` | "1g" | 0.2.5 | Heap size for Blazegraph |

Note on `BLAZEGRAPH_EXTRA_OPTS`: These options are directly passed to the Blazegraph JAR file; they must be prefixed with `-D`. Example: `-Dhttps.proxyHost=http://my.proxy.com -Dhttps.proxyPort=3128`. See [the Wikidata Query Service User Manual](https://www.mediawiki.org/wiki/Wikidata_Query_Service/User_Manual#Configurable_properties) for all available options.

### Filesystem layout

| File | Description |
| --- | --- |
| `/wdqs/allowlist.txt` | SPARQL endpoints allowed for federation |
| `/wdqs/RWStore.properties` | Properties for the service |
| `/templates/mwservices.json` | Template for MediaWiki services (populated and placed into `/wdqs/mwservices.json` at runtime) |

### Troubleshooting

The image requires at least 2 GB of available RAM to start.

### Development

New releases available for image creation can be found on Archiva: https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/

When creating a new image, you may need to update RWStore.properties to match the properties used in Wikidata production.

Thus it's easier to create new releases for WDQS versions that have been tested in Wikidata production.

When creating a new release, you can reach out to the WMF Search platform team for help syncing the wdqs version and RWStore.properties file.

[RecentChanges]: https://www.mediawiki.org/wiki/API:RecentChanges
