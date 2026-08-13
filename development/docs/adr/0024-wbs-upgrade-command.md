# 24) Add a WBS upgrade command {#adr_0024}

Date: 2026-08-09

## Status

proposed

## Context

Updating WBS currently requires users to discover an available release, pull the corresponding repository changes, and follow the appropriate instructions. Minor and patch updates should be routine and highly reliable. Major upgrades may require version-specific data, configuration, and service migrations and currently rely on migration guides.

WBS Tools now provides a reusable foundation for configuration and lifecycle workflows. Each WBS update can also select a newer exact WBS Tools image, which is pulled automatically the next time a WBS command needs it. A minor or patch release on the current WBS major can therefore deliver the upgrade facility needed to begin migration to the next major release.

## Decision

Propose adding a user-facing `wbs upgrade` command. The command discovers available WBS releases, presents the valid upgrade choices, asks the user which release to adopt, and orchestrates the selected path. The final terminology could distinguish an **upgrade** from the **migration** performed during a major-version transition, but `wbs upgrade` is the proposed root command.

Minor and patch upgrades should be straightforward, dependable operations. Major upgrades should reuse the same orchestration while adding target-release-owned migration steps, explicit review and approval, and support for only one adjacent major version at a time. The current WBS major may first receive a minor or patch release that provides the tools and handoff required for the next major upgrade.

Release discovery, compatibility declarations, backup requirements, checkout transitions, and failure and recovery behavior remain to be decided before implementation.

## Consequences

Users can eventually manage routine updates and guided major upgrades through one WBS entry point. Minor and patch handling can establish the reliable common workflow before major migration is exposed. Each major migration must still be tested against the immediately preceding WBS release and define its safety and recovery expectations.
