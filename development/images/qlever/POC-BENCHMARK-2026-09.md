# QLever POC: release readiness and benchmark findings (September 2026)

This is a provisional record of the QLever/Wikibase Suite proof-of-concept on
PR #966, commit `bc38f4ecf7a58dcb88262dc1c035c31fcfcda1a6`. It separates two
things that should not be conflated:

1. **Operational readiness:** making QLever the usable query stack in
   Wikibase Suite.
2. **Benchmarking and future bootstrap work:** learning its resource envelope
   and preparing reproducible data/query workloads.

It is evidence from one synthetic fixture and two VPS sizes, not a sizing
guarantee or a release promise.

## 1. Operational readiness: state of the branch

### What was demonstrated

- The branch supplies a QLever query image, a separate Recent Changes updater,
  and query/query-ui/query-updater Compose services. The updater persists its
  cursor and QLever's update log.
- A normal Wikibase API burst of 1,000 connected items produced Recent Changes
  events that the updater consumed. It caught up from recent-change ID 264 to
  1274 and populated one named graph per entity.
- After an OOM restart, QLever replayed 764,580 persisted inserted triples and
  8,588 persisted deletions, then became ready. This is evidence for durable
  incremental recovery, not just a one-shot happy path.
- The QLever image starts an empty index when it has none. That is appropriate
  for a known-empty fresh wiki: subsequent normal edits are captured by Recent
  Changes.
- The 4 GB VPS ran the normal Suite stack, QLever, the updater, and OpenSearch
  together. The final OpenSearch index rebuild also completed successfully.

### Fresh install, existing install, and reindexing

There are deliberately two different cases:

| Situation | Safe current behaviour | Remaining product work |
| --- | --- | --- |
| New, empty Wikibase | Create an empty QLever index; index later normal edits incrementally. | Document this as the fresh-install path. |
| Existing wiki or changes made outside normal Recent Changes | A full export/reindex is required to establish or repair the QLever baseline. | Define the user-facing upgrade/migration workflow and its progress/recovery UX. |

The empty-index behaviour must not be presented as a migration solution for an
already populated wiki. It cannot reconstruct history that the updater never
saw.

### Separate OpenSearch finding

The top-level MediaWiki search failure on the VPS was not a QLever defect. The
2 GB OpenSearch instability had left its CirrusSearch indices effectively
empty. A full CirrusSearch rebuild on the 4 GB VPS restored them:

- 1,144 content documents were indexed;
- entity lookup found `Burst A record 0001` as `Q154`;
- property lookup found `Seed source code` as `P6`; and
- item-namespace full search found the fixture's descriptions.

Arbitrary string-valued statements such as `BURST-A-00001` were still not
returned by the default search profile. That is a search-profile/capability
question, not evidence that the reindex failed. Release operations need a
documented CirrusSearch reindex runbook alongside QLever's reindex runbook.

### Work still needed before calling this a comfortable beta replacement

1. **Centralize image metadata.** The initial branch installer failure exposed
   duplicate hard-coded image lists in build discovery, Compose, CI, tests,
   local overrides, and installer publication. Use one declarative registry
   that distinguishes buildable images, default runtime images, and
   build-only/installer-support images. The trusted publisher must validate
   PR metadata and derive allowed names/tags itself.
2. **Finish the upgrade story.** Specify and test an explicit full-reindex
   path for existing WDQS installations, including interruption/restart and
   user-facing status. This is intentionally later than the fresh-install
   path, but is a release requirement.
3. **Keep test bootstrap out of default Compose.** No user-facing bootstrap
   should be added to the root Compose file yet. Development fixtures belong
   under `development/` or a development-only override.
4. **Complete release-facing documentation.** The image README should be the
   operational entry point; retain POC material under `development/`. Document
   memory settings, full reindex, empty-index semantics, and the distinction
   from OpenSearch/CirrusSearch reindexing.
5. **Broaden automated coverage.** Preserve the current updater/replay tests
   and add deterministic coverage for qualifiers, references, datatypes,
   deletes, entity types/extensions, reindex interruption, and an
   install/upgrade smoke path.
6. **Choose defaults from a larger benchmark.** The current image fallback is
   `QLEVER_QUERY_MEMORY=256M`. This POC used 512 MB on a 4 GB host; it does
   not justify baking a new global default yet.

## 2. Benchmarking and stress testing

### Environment and fixture

- Wikibase Suite PR #966, 2 GB and then 4 GB / 2 vCPU VPS; no swap.
- QLever query service, persisted Recent Changes updater, OpenSearch,
  MariaDB, Wikibase, job runner, query UI, and normal Suite services shared a
  host.
- 1,143 items and 6 properties: a 120-record connected seed plus 1,000 normal
  API-created burst records.
- Every burst item had six statements: domain, location, two item relations,
  and two string identifiers.

### Graph-size measurements

The updater stores entity RDF as named graphs. Both counts below are correct,
but answer different SPARQL questions:

| Measurement | Query shape | Observed value |
| --- | --- | ---: |
| Default-graph triples | `?s ?p ?o` | 71,193 |
| Stored entity-graph triples | `GRAPH ?g { ?s ?p ?o }` | 191,145 |
| Named graphs | `COUNT(DISTINCT ?g)` | 1,150 |
| Entity Recent Changes | updater cursor evidence | 1,270 |

For this test, the named-graph total is the useful overall QLever storage-scale
number. The default graph is not a union view of those named graphs. Wikibase
RDF expands each statement into additional statement, value, label, and
ontology triples, so raw statement count alone is misleading.

At 191k stored triples, this is a smoke-to-small fixture. It is far below
public Wikibases in the Wikibase Explorer, where even the lower end of the
first displayed page is in the millions of triples. It remains useful for
update correctness, recovery, and join-cardinality tests, not production-scale
capacity claims.

### 2 GB result

The complete default stack is not viable on this 2 GB host:

- OpenSearch with its normal `-Xms512m -Xmx512m` heap repeatedly hit kernel
  OOM during startup (observed Java RSS roughly 650--850 MiB before kills).
- A temporary 256 MB heap also failed during startup.
- A temporary 128 MB heap reached health at about 475--480 MiB RSS, allowing
  the small fixture to load, but later sustained/query load still exhausted
  the host. The kernel killed OpenSearch and later QLever.

QLever itself was comparatively modest during ingestion (roughly 38--160 MiB,
then about 161--166 MiB at catch-up completion), but that does not rescue the
whole-stack 2 GB configuration. A 128 MB OpenSearch heap is an experiment,
not a recommended global default.

### 4 GB result

The same host, resized in place to 4 GB / 2 vCPU, ran the normal 512 MB
OpenSearch heap and all services stably. At the final post-reindex snapshot:

| Component | Observed container memory |
| --- | ---: |
| OpenSearch | 1.026 GiB |
| QLever | 262 MiB |
| Wikibase | 222 MiB |
| MariaDB | 121 MiB |
| QLever updater | 10 MiB |
| Host available RAM | 1.63 GiB |

There was no swap, kernel OOM, or sustained memory pressure in this normal
4 GB state. The practical POC conclusion is therefore:

> **4 GB is a sensible current minimum starting point for the complete
> QLever-based Suite stack.**

It is an adequate baseline for an empty/small Wikibase and ordinary queries,
not a claim that every workload fits in 4 GB.

### Query-memory behaviour

`QLEVER_QUERY_MEMORY` maps to QLever's `--memory-max-size` (`-m`) and limits
total query-processing *and cache* allocator budget. It is deliberately an
internal safety ceiling, not a direct Docker RSS target.

- At 512 MB, ordinary selective/grouped queries completed in 113--544 ms; a
  missing-metadata anti-join completed in 189--227 ms.
- The bounded three-way analytical query with a `LIMIT 120` subquery failed at
  512 MB but completed in 5.077 seconds at a temporary 1 GB limit.
- Unbounded same-domain three- and four-way self-joins were rejected safely at
  1 GB, 1.5 GB, and 2 GB. They ask for every possible combination of records
  in a domain, so their intermediate result grows combinatorially and is not
  a representative user query.
- Docker/RSS samples never imply that `-m` bytes are resident. The QLever
  allocator can refuse a query below the host's physical-memory limit, which
  is the desired failure mode. Query errors remained controlled; no host OOM
  occurred in the 4 GB trials.

The three retained ordinary-query examples are:

1. Per-domain counts of records, locations, and related entities.
2. A selective pairwise comparison between `Q13` and `Q14` cohorts per domain.
3. A `FILTER NOT EXISTS` / optional data-quality query for records missing
   expected metadata.

The unbounded self-join remains valuable as a negative/safety test, but should
not be presented as a normal UI example.

## 3. Two bootstrap tracks (do not combine them)

### A. Development benchmark bootstrap

This is a reusable, repository-owned test harness, not an installation
feature. It should live under `development/` and provide:

- deterministic fixture generation through normal Wikibase APIs;
- profiles from tiny through multi-million triples, with documented topology
  rather than just a raw item multiplier;
- controlled updates/deletes and an updater-cursor/graph-count validator;
- a full-export/reindex exercise separate from incremental updates;
- structured resource, index-size, throughput, backlog, latency, and query
  result captures; and
- configurable query-UI example sets, including the three normal queries and
  clearly labeled stress/recovery queries.

The query examples should be injected through the existing query-UI example
configuration rather than invented as a new UI system. A benchmark profile can
then open with useful queries already available to a tester.

### B. Ontology bootstrap for new users

This is a separate future product requirement: curated ontology/content
onboarding for a new Wikibase. It needs explicit user intent, provenance,
versioning, and predictable QLever indexing. Do not use the synthetic
benchmark seeder or root Compose configuration as its implementation.

The shared lesson is only that both workflows need a reliable full-index path;
their data, UX, and ownership are different.

## 4. Preserved evidence and next steps

- 2 GB raw monitor: [`benchmark-artifacts/vps-2gb-memory-monitor.jsonl`](benchmark-artifacts/vps-2gb-memory-monitor.jsonl)
- 4 GB raw monitor: [`benchmark-artifacts/vps-4gb-memory-monitor.jsonl`](benchmark-artifacts/vps-4gb-memory-monitor.jsonl)

Recommended next work, in order:

1. Land/review the operational beta-readiness work and central image metadata
   follow-up separately from benchmark tooling.
2. Define a benchmark fixture/profile contract and implement it solely under
   `development/`.
3. Run that harness on 4 GB and 8 GB with a genuinely larger, semantically
   varied corpus; record QLever, OpenSearch, and total-stack behaviour.
4. Only then choose documented memory profiles/defaults and design the
   user-facing ontology-bootstrap workflow.
