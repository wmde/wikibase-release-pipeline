# QLever Query Service image

This version-pinned wrapper supplies the QLever query server and static index
builder for Wikibase Suite. `server` is the default command; `index` rebuilds
the static index using the tested default `Qleverfile` baked into the image and
clears persisted update deltas. After a successful development bootstrap it
also releases the updater pause lock. Advanced deployments can mount a
replacement file directly at `/etc/qlever/Qleverfile` for an index build.

`Qleverfile` controls index construction, including `STXXL_MEMORY`. The server
command controls live serving separately: `-m` is total query memory, `-c` is
the cache limit, `-e` caps an individual result, and `-k` caps cached results.
They are complementary lifecycle settings, not duplicate configuration.

## Runtime configuration

The following environment variables control the default `server` command:

| Variable | Default | Meaning |
| --- | --- | --- |
| `QLEVER_THREADS` | `2` | Query-server worker threads. |
| `QLEVER_QUERY_MEMORY` | `256M` | Total memory available to query evaluation. |
| `QLEVER_CACHE_MEMORY` | `64M` | Query cache memory limit. |
| `QLEVER_MAX_RESULT_SIZE` | `32M` | Maximum size of one query result. |
| `QLEVER_MAX_CACHED_RESULTS` | `100` | Maximum number of cached results. |

The Suite Compose file passes these values from `.env`; the image defaults also
make the image usable outside the Suite.

The development-only QLever test overlay combines this image with the separate
lean `qlever-updater` image to export current Wikibase RDF before indexing.
That full-export workflow is deliberately not a default Suite runtime feature.
