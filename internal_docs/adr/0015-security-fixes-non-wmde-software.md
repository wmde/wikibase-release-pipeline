# 15) Including and Publishing Security fixes {#adr_0015}

Date: 2021-05-03

## Status

proposed

## Context

WMDE needs to decide on a process for including security fixes of non-WMDE maintained software (e.g. Mediawiki, Elasticearch, WDQS) as well as WMDE maintained software (Wikibase, WDQS-frontend) and how to publish security fix releases of Wikibase suite in such cases.

Security fixes for WMDE maintained software will fall under the maintenance category and will most likely be worked on by campsite, however as the running of the pipeline and publishing of docker images requires special privileges it could make sense that this step is tasked to a certain group of people or that all engineers of WMDE are given the rights to publish releases.

Applying security fixes to the running Wikibase instance (or other Wikibase related software system) is a time-sensitive operation. Therefore WMDE will pre-announce the upcoming security release a bit in advance before making the fixes (hence also vulnerabilities) public, to allow maintainers of Wikibase instances to plan for their updates.

## List of steps reporting, fixing and releasing security updates for WMDE maintained software

### 1. Recognizing / Reporting

- Report using `security@wikimedia.org` would be forwarded to WMDE staff
- Report using [phabricator task](https://phabricator.wikimedia.org/maniphest/task/edit/form/75/)
- Task will only be visible to security team at first then delegated to WMDE staff.

### 2. Resolving

- Don't publish the fix before it's deployed in WMF production environment

### 3. Deploy fix to WMF production environment

- [Follow deployment instructions from here](https://wikitech.wikimedia.org/wiki/How_to_deploy_code#Creating_a_Security_Patch)

### 4. Releasing

- Merge security patch into public repository.
- Build a new release.
- Verify the patch resolved the security problem.
- Announce that there will be a "security fix" release coming up shortly (24-36 hours before the planned publishing of the new release).
- Publish the release.
- Announce new release.

### Components Included

#### MediaWiki

In the case of MediaWiki or any extension (including Wikibase) on Gerrit, [triggering a new build](../../docs/topics/pipeline.md) on the release branch where the security fix has been applied and then [publishing](../../docs/topics/publishing.md) the new release should be sufficient to include the security fixes in the new docker images and tarballs.

#### ElasticSearch

As for ElasticSearch we first need to acknowledge the fact that upgrading to anything beyond 7.11 would not be possible due to the new [license](https://www.elastic.co/pricing/faq/licensing) and the fact that the version we currently pin releases to is [likely not receiving security fixes](https://www.elastic.co/support/eol). If however ElasticSearch were to receive security patches we simply need to update the pinned version and publish a new release from the pipeline.

#### WDQS

As for WDQS we need to identify what version contains the security fix and make sure it's been made [publicly available](https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/) for us to pin it to a new release then run the pipeline and publish the resulting docker images.

### Announcing the release to community

All releases, major or minor should be announced on the [Wikibase User Group](https://lists.wikimedia.org/mailman/listinfo/wikibaseug) and [Wikidata Tech](https://lists.wikimedia.org/mailman/listinfo/wikidata-tech) mailing lists, in the [Wikidata Weekly Summary](https://www.wikidata.org/wiki/Wikidata:Status_updates), as well as on the [Wikibase Telegram Group](https://t.me/joinchat/HGjGexZ9NE7BwpXzMsoDLA).

Pre-release announcement about the security releases will also be published on the above listed channels.

### Recognizing the need to release

To some extent the most important part of continuously delivering security fixes is to be notified of when they are available. Since most of the code shipped in the Wikibase docker images aren't WMDE maintained we need to become aware of when they are available to be included.

For MediaWiki we could add some simple test to compare which is the latest stable version we have released to the one that [currently is available](https://www.mediawiki.org/wiki/Template:MW_stable_release_number). When there is a mismatch we know there is a release available.

For other software without a constant release cycle or even explanation as to why the software was updated this will be much harder to accomplish.

## Decision

- ANY component included in the wikibase suite (docker images, tarballs) that has a security update available can generate a new release. It is up to the team to determine it's severity and if a new release is required.
- ALL MediaWiki maintenance releases should generate a new Wikibase release.
- Add some kind of mechanism that regularly checks what the latest stable MediaWiki version is. If the version has changed we should do a release.
- Add a link to the [bug reporting documentation](https://www.mediawiki.org/wiki/Reporting_security_bugs) on the [Wikibase landing page on mediawiki.org](https://www.mediawiki.org/wiki/Wikibase)

## Consequences
