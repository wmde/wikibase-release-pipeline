# 16) Updating the software not maintained by WMDE {#adr_0016}

Date: 2021-05-05

## Status

proposed

## Context

Wikibase Suite includes a number of software components that are not maintained by Wikimedia Deutschland (WMDE). Those include (examples as of May 2021):

- Software which is maintained by the Wikimedia Foundation (WMF), e.g. Wikidata Query Service (WDQS); in case of docker images also MediaWiki software.
- Broadly-used software which is maintained by non-Wikimedia parties, e.g. Elastic Search.
- Wikibase/Wikidata-specific software which is maintained by Wikimedia community (volunteer) developers, e.g. Quick Statements.

All these software components receive updates from their maintainers in a way which is not necessarily synchronized with the release cycle of Wikibase Suite. Users of Wikibase Suite might benefit from those changes, in particular from the updates which fix the incorrect functionality (bugs), and issues related to the software security.

Offering updates to software components not maintained by the WMDE that are known to compatible with the rest of the Wikibase Suite would require applying updates to versions of the components included in the Wikibase Suite, possible changes to Wikibase Suite structure (e.g. configuration) when applicable, and necessary testing procedures to ensure continued functionality of the Wikibase Suite with the updated components.

There might also be changes desired by the users of Wikibase Suite to be made to these software components (e.g. new functionality, bug fixes) that might be not be provided by the maintainers in subjectively-perceived timely manner.

Making changes to the software not maintained by WMDE would mean additional effort for WMDE's software developer teams, and likely require WMDE development teams gather additional expertise to be able to make good contributions to those software components.

## Decision

To ensure the security and integrity of systems running Wikibase Suite, WMDE will be releasing updated versions of the Wikibase Suite that will include fixes to significant security issues discovered in the software components not maintained by WMDE, once those fixes have been published by respective maintainers.

Occassionally, WMDE might also publish releases of Wikibase Suite that will include updates to the components not maintained by WMDE that bring important additional functionality.

In order to maximize the impact WMDE software development teams can bring for the users of Wikibase Suite, WMDE will generally not be making changes to the software components of the Wikibase Suite that are not maintained by WMDE.

## Consequences

1. WMDE establishes a process of incorporating and releasing fixes to severe security issues in the components not maintained by WMDE. See more on this in [ADR 15](0015-security-fixes-non-wmde-software.md).
2. WMDE will monitor changes to the components of Wikibase Suite which are not maintained by WMDE to understand non-security-related changes happening in those components. The list of channels to follow by WMDE staff will be published for internal use.
3. WMDE will not accept feature requests and other change requests related to the software components that WMDE does not maintain.
4. WMDE will direct users of Wikibase Suite, e.g. by visibly documenting this information, on channels they should use to report problems or feature requests in the components not maintained by WMDE (it might be Phabricator for some software, and dedicated bug trackers, etc for other).
