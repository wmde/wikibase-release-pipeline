

# Generating release notes

There is a simple script based on the [MediaWiki release tools](https://gerrit.wikimedia.org/r/admin/repos/mediawiki/tools/release) 
that can be used to generate diffs between development and release branches.

Example usage:

```sh
$ python publish/release_notes/wikibase_notes.py REL1_36 master

=== Wikibase ===
* (T281341) Remove getTermInLangIdsResolver from SingleEntitySourceServices
* (T281341) WikibaseClient: Wire up TermInLangIdsFactory service
* (T281341) WikibaseRepo: Wire up TermInLangIdsFactory service
...

```

Further reading:

[ADR0005 on Wikibase Repository release notes](../adr/0005-release-notes-process.md)
[ADR0007 on publishing release notes](../adr/0007-wikibase-release-notes-publish.md)


