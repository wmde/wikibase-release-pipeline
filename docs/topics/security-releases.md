# Security Releases

You can find the latest base components that may need updating from these locations:

**With releases**

- `MEDIAWIKI_VERSION` & `RELEASE_VERSION`: https://www.mediawiki.org/wiki/Release_notes by looking at the most recent release versions in the top banner, and choosing the latest security release for the major MediaWiki version being used.
- `ELASTICSEARCH_VERSION`: https://hub.docker.com/_/elasticsearch by looking for the latest tag of the major version currently being used.
- `ELASTICSEARCH_PLUGIN_EXTRA_VERSION`: https://mvnrepository.com/artifact/org.wikimedia.search/extra by looking for the latest wmf release of the major version currently being used.

**Commit hash based**

You can see all new commits since the commit being used using a comparison URL (see below).

 You can then use a new commit hash that only includes minor fixes including security updates to packages and code.

- `WDQS_FRONTEND_COMMIT_HASH`: https://github.com/wikimedia/wikidata-query-gui/compare/3be93201ca2efad44f36430b8cf3a2c94cb22ebf...master
- `QUICKSTATEMENTS_COMMIT_HASH`: https://github.com/magnusmanske/quickstatements/compare/757d238cf6d306f9daf8276f620415cf09f4afe6...master
- `MAGNUSTOOLS_COMMIT_HASH`: https://bitbucket.org/magnusmanske/magnustools/branches/compare/master..7db2f401390df471d9650010ce059e4308d0cc9e This repository includes lots of code that is not being used withing quicksttaements. Changes to this code could be ignored.
- `WIKIBASELOCALMEDIA_COMMIT_HASH`


**No specific security releases**

- `WDQS_VERSION`: WDQS does not currently have "security releases" so to speak. Any needed increments would need to be advised from the WMF team.
