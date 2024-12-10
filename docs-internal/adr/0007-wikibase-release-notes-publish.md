# 7) Wikibase Extension release notes publishing {#adr_0007}

Date: 2021-01-14

## Status

accepted

## Context

We have in [ADR0005] proposed a process for maintaining our release notes within the repository we also want to make a decision as to where these should be published for a broader audience.

As our process for maintaining release notes will be closely modeled after mediawiki it also makes sense to review how mediawiki is publishing theirs.

As described in [ADR0005], mediawiki is maintaining release notes for each specific release within the corresponding release branch. During the preparation of creating a new release from the development branch, a new release branch is cut and the [template] that has been populated with the relevant changes from the ongoing development is to serve as the base for a richer curated version on mediawiki.org [(Example: 1.35)](https://www.mediawiki.org/wiki/Release_notes/1.35).

The release notes document within the repository does not contain the full links to documentation or phabricator tickets but is supported by templates to generate these dynamically.

For links to phabricator the task number is used by the [PhabT] template which also supports linking to comments, this could easily be re-used by WMDE as we are also using phabricator.

```
=== Changes since MediaWiki 1.35.0 ===
* ({{PhabT|263929}}) purgeList.php Fix all-namespaces option to match one used in code.
```

For links to documentation topics referring to the mediawiki manual the [Localized link template] is used to generate these.

```
==== New configuration ====
* {{ll|Manual:$wgDiffEngine|$wgDiffEngine}} — This can be used to specify the difference engine to use, rather than MediaWiki choosing the first of {{ll|Manual:$wgExternalDiffEngine|$wgExternalDiffEngine}}, wikidiff2, or php that is usable.
```

As the Wikibase documentation is not maintained on mediawiki.org an alternative template would need to be created to support similar links to the Wikibase documentation. A review and update of the documentation is also required as not all links currently support linking to documentation topics by their canonical name.

```
$wgWBRepoSettings['changesDatabase']

https://doc.wikimedia.org/Wikibase/master/php/md_docs_topics_options.html#changesDatabase
```

```
$wgWBRepoSettings['useChangesTable']

https://doc.wikimedia.org/Wikibase/master/php/md_docs_topics_options.html#autotoc_md251
```

## Decision

Adopt a similar process to that of mediawiki and publish release notes on mediawiki.org

## Consequences

- An overview of the wikibase release notes will be presented on https://www.mediawiki.org/wiki/Wikibase/Release_notes in a similar manner to that of [mediawiki](https://www.mediawiki.org/wiki/Release_notes)
- Each major release will have a curated version of the release notes maintained within the repository published under https://www.mediawiki.org/wiki/Wikibase/Release_notes/N.NN with further links to relevant documentation and phabricator tickets.
- Review and update the [Wikibase documentation] to support direct links to configuration settings and the different topics by name.

[template]: https://gerrit.wikimedia.org/r/c/mediawiki/core/+/611247/3/RELEASE-NOTES-1.36
[ADR0005]: (0005-release-notes-process.md)
[Wikibase documentation]: (https://doc.wikimedia.org/Wikibase/master/php/)
[PhabT]: (https://www.mediawiki.org/wiki/Template:PhabT)
[Localized link template]: (https://www.mediawiki.org/wiki/Template:Localized_link)
