# 23) Add release preflight checks {#adr_0023}

Date: 2026-08-09

## Status

proposed

## Context

Release preparation is primarily covered by the normal test suite and `wbs-dev update` plans. Publication already validates stable versions, matching changelog entries, a clean remotely available commit, and required published images.

A final preflight check could provide useful defense in depth, but its contracts are not yet defined. In particular, WBS, WBS Tools, and the WBS Docker Images are independently versioned, so checks based only on matching their current major versions could reject intentional release combinations. Repeating ordinary tests or upstream discovery during publication would also add code, latency, and competing sources of truth.

## Decision

Consider a future WBS release preflight that reuses the same underlying validation as publication. This may require no separate command: the existing release dry run could present the preflight result, while an actual release would run the same checks and reject publication when an established requirement fails. Do not add a separate preflight subsystem until its contracts and ownership are explicit.

Candidate checks include tag collisions, declared cross-product compatibility, and intentional review of retained image majors during a new WBS major release. Repository invariants should remain in the normal test suite, and upstream currency should remain in update plans. Preflight warnings should be non-blocking; only checks with an established release contract should prevent publication.

## Consequences

For now, release confidence continues to come from the test suite, update plans, release review, and the existing publication validation. A later implementation should remain small, avoid duplicating those systems, and use one validation path for dry runs and publication.
