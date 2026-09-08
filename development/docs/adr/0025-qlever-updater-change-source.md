# 25) Use Recent Changes as the QLever updater's correctness source {#adr_0025}

Date: 2026-09-08

## Status

accepted

## Context

The QLever updater must discover every committed Wikibase entity change and
recover safely after a restart or temporary outage. It currently stores a
Recent Changes cursor, fetches the current RDF snapshot for each changed
entity, and replaces that entity's named graph. The snapshot replacement is
idempotent, so a repeated change is safe.

MediaWiki EventStreams can expose Recent Changes with Server-Sent Events, but
a self-hosted deployment requires the EventStreams service and Kafka.
MediaWiki's EventBus producer also documents that hook and deferred-request
delivery is not atomic with the MediaWiki database transaction: an event can
be lost after a successful edit. A stream therefore cannot be the sole
correctness mechanism for this deployment.

## Decision

Use MediaWiki's Recent Changes API and its persisted cursor as the QLever
updater's canonical change source. Preserve the retention-window guard: if
the stored cursor has expired, stop rather than silently serving stale data.
Recover by reconciling entity graphs and performing a bootstrap that records a
new cursor. Schedule periodic reconciliation appropriate to the installation's
write rate and Recent Changes retention.

Do not make EventStreams, EventBus, or Kafka a default Wikibase Suite
dependency. A future operator may add a stream consumer as an optional
low-latency accelerator, but it must retain Recent Changes catch-up and
periodic reconciliation as correctness backstops.

## Consequences

The default Suite deployment has no Kafka or event-service operational burden
and can prove its recovery behavior using data already committed to Wikibase.
The updater's latency is bounded by its polling interval rather than immediate
event delivery. Operators must monitor updater health and perform the defined
recovery if Recent Changes history expires.

An optional future streaming integration needs durable consumer offsets,
reconnection handling, Recent Changes catch-up, and reconciliation tests; it
does not simplify the base updater's correctness contract.

## References

- [MediaWiki EventStreams](https://www.mediawiki.org/wiki/EventStreams)
- [MediaWiki EventBus source documentation](https://github.com/wikimedia/mediawiki-extensions-EventBus)
