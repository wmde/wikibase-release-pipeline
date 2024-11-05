# 1) Use releases.wikimedia.org for hosting release tarballs {#adr_0002}

Date: 2020-12-04

## Status

accepted

## Context

We need to determine a place to host our new release artifacts (tarballs). Currently releases are being served by the Extension Distributor and the release branches of the git repositories.

## Github

#### pros:

- The same framework we use to produce the artifacts (in the current implementation of the release pipeline)
- Minimal effort required.

#### cons:

- Not a WMF/WMDE service
- Needs to use the github frontend or routing with a token to get the artifacts (unless it's made into a release)

## releases.wikimedia.org

#### pros:

- Unified front for releases of the Wikimedia Foundation.

#### cons:

- Poor documentation (https://wikitech.wikimedia.org/wiki/Releases.wikimedia.org) for what we are looking for.
- Seemingly bound to puppet/modules/releases repository for configuration
- No direct control, needs negotiation.
- Does not seem to be hosting any other extensions (ExtensionDistributor seems to be the desired place for these). However, Mediawiki with bundled extensions is released there https://releases.wikimedia.org/mediawiki/1.35/

## Wikiba.se

#### pros:

- WMDE owned means direct control
- The official site for Wikibase

#### cons:

- We would need to build something that either pulls the artifacts or gets them uploaded from the pipeline.
- Effort required is estimated to be high.
- Meant to be a marketing website

## Extension Distributor

#### pros:

- Seems to be the "goto place" for MediaWiki extensions

#### cons:

- Looking through [the code](https://github.com/wikimedia/labs-tools-extdist) we would need to adapt it to serve our needs which might be undesired.
- Does not align with our needs of simple a hosting space for artifacts.
- Does not support other software than MediaWiki extensions (WDQS, WDQS ui etc.)

---

| Repository | Service provider | Free to WMDE | Self-Service (1) | Method of publishing | Visibility/Current usage | Estimated effort | Documentation | URL | Trusted |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Github | Github/Microsoft | Currently, Might change in the future. (2) | Yes | Github Releases / Github Action Artifact | - | Low | Good | github.com/wikimedia/ | no |
| WMF Releases | WMF | Yes | No (negotiation needed - likely only initially) | FTP/SFTP/SCP | - | High | Poor | releases.wikimedia.org | yes |
| Wikiba.se | WMDE | Yes | Yes | FTP or some kind of pulling by the server (TBD - not existing yet) | - | High | Poor (non existent) | wikiba.se, or releases.wikiba.se | yes |
| ExtensionDist | WMF/Volunteers? | Yes | No (negotiation needed - likely only initially) | Undefined, would need adaptations | Low (3) | Very High | Poor | extdist.wmflabs.org/dist/ | yes |

---

1. We can create new tarballs and publish without filing a ticket or speaking to admins
2. WMDE (github.com/wmde) has a free open source plan with Github. WMF (github.com/wikimedia) does not
3. https://grafana.wikimedia.org/d/000000161/extension-distributor-downloads?orgId=1&from=now-5y&to=now

## Decision

- Wikibase release artifacts will be hosted on the WMF-controlled domain https://releases.wikimedia.org/.

## Consequences

- A new release group called `releasers-wikibase` will be created for access to the repository
- An [SRE-Access-Request] will be created, and the hike team members will be added as initial maintainers. The group will be later on expanded to cover other relevant WMDE staff.
- Publishing step of Wikibase release pipeline will be adjusted to publish tarball release artifacts to https://releases.wikimedia.org/wikibase/ (or similar directory - final name to be defined during the implementation).

[SRE-Access-Request]: https://phabricator.wikimedia.org/T268818
