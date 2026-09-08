# QLever updater image

This image continuously synchronizes Wikibase entity RDF into QLever using
entity-owned named graphs. It is the incremental Query Service synchronizer;
it does not build or serve a QLever index.

## Configuration

| Variable | Default | Meaning |
| --- | --- | --- |
| `WIKIBASE_URL` | `http://wikibase` | Internal Wikibase URL for the API and entity RDF. |
| `WIKIBASE_RDF_BASE` | `WIKIBASE_URL` | Canonical public base URL used in RDF subjects. |
| `WIKIBASE_ENTITY_NAMESPACES` | discovered from MediaWiki | Optional comma-separated entity namespace IDs for a full export; use for custom entity types that cannot be discovered from their content model. |
| `QLEVER_URL` | `http://query:7001` | Internal QLever Graph Store endpoint. |
| `QLEVER_ACCESS_TOKEN` | — | Credential for QLever mutations. The Suite supplies it automatically as a Docker secret. |

The updater stores its cursor and health state in `/data`, which must persist
with the QLever index. It replaces an entity's complete named graph for each
change, making replays safe.
