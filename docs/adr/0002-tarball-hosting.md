# 1) Use Github for hosting release tarballs {#adr_0002}

Date: 2020-11-20

## Status

proposed

## Context

We need to determine a place to host our new release artifacts (tarballs). 
Currently releases are being served by the Extension Distributor and the release branches of the git repository. 

## Github

#### pros: 

- The same framework we use to produce the artifacts
- Minimal effort required.

#### cons:

- Not a Foundation service
- Needs to use the github frontend or routing with a token to get the artifacts (unless it's made into a release)

## releases.wikimedia.org

#### pros: 

- Unified front for releases of the Wikimedia Foundation.

#### cons:

- Poor documentation (https://wikitech.wikimedia.org/wiki/Releases.wikimedia.org) for what we are looking for.
- Seemingly bound to puppet/modules/releases repository for configuration
- No direct control, needs negotiation. 
- Does not seem to be hosting any other extensions (ExtensionDistributor seems to be the desired place for these)

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

- Seems to be the goto place for MediaWiki extensions

#### cons:

- Looking through the code we would need to adapt it to serve our needs which might be undesired.
- Does not align with our needs of simple a hosting space for artifacts.
- Does not support other software than MediaWiki extensions (WDQS, WDQS ui etc.)

---

| Repository    | Service provider   | Free to WMDE                   | Self-Service (1)       | Method of publishing                                 | Current usage  | Estimated effort  | Documentation | URL                       | Trusted |
| ------------- |------------------- | ------------------------------ | ---------------------- | ---------------------------------------------------- | -------------- | ----------------- | ------------- | --------------------------|---------|
| Github        | Microsoft          | Currently                      | Yes                    | Github Releases / Github Action Artifact             | -	           | Low               | Good          | github.com/wikimedia/     |   no    |
| WMF Releases  | Wikimedia          | Yes                            | Not currently          | FTP                                                  | -              | High              | Poor          | releases.wikimedia.org    |   yes   |
| Wikiba.se     | Wikimedia DE       | Yes                            | Yes                    | FTP or some kind of pulling by the server            | -              | High              | Poor          | wikiba.se                 |   yes   |
| ExtensionDist | Wikimedia          | Yes                            | Not currently          | Undefined, would need adaptations                    | Low (2)        | High              | Poor          | extdist.wmflabs.org/dist/ |   yes   | 

---

1. We can create new tarballs and publish without filing a ticket or speaking to admins
2. https://grafana.wikimedia.org/d/000000161/extension-distributor-downloads?orgId=1&from=now-5y&to=now

## Decision

* Wikibase release artifacts will be hosted on the foundation controlled domain https://releases.wikimedia.org/wikibase/ 
## Consequences

* A new release group called `releasers-wikibase` will be created for access to the repository
* An [SRE-Access-Request] will be created for the hike team members to be added to

[SRE-Access-Request]: https://phabricator.wikimedia.org/tag/sre-access-requests/
