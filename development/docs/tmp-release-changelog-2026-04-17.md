# Release Changelog Notes

Date: 2026-04-17

## MediaWiki core

As of 2026-04-17, this branch is pinned to `MEDIAWIKI_VERSION=1.45.3` in [build/wikibase/build.env](/Users/lorenjohnson/dev/wmde/wikibase-release-pipeline/build/wikibase/build.env:10).

- Previous pinned version in this branch: `1.45.0`
- New pinned version in this branch: `1.45.3`
- Repo diff source: [build/wikibase/build.env](/Users/lorenjohnson/dev/wmde/wikibase-release-pipeline/build/wikibase/build.env:10)
- Upstream compare: [MediaWiki 1.45.0...1.45.3](https://github.com/wikimedia/mediawiki/compare/1.45.0...1.45.3)
- Release notes: [MediaWiki 1.45 release notes](https://www.mediawiki.org/wiki/Release_notes/1.45)

Note: your message mentioned `1.45.4`, but the branch currently contains `1.45.3`.

## Extensions

The second `update-commits` run did not change any extension pins. Each variable was reported as `Commit:` rather than `Old Commit:` and `New Commit:`, and the values in [build/wikibase/build.env](/Users/lorenjohnson/dev/wmde/wikibase-release-pipeline/build/wikibase/build.env:47) match the already-updated pins from the earlier run.

Because there was no extension pin movement in this rerun, there are no new extension-to-extension compare links to add for this step.

## Earlier extension compare links

If you still want the links from the earlier extension update (`old -> latest`), they are:

- `WIKIBASE_COMMIT`: [8da73aa416822769777df084a54eb921f6238798...a5025e70d1694e365ddc4c8f5b87f901558a4c58](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/Wikibase/+log/8da73aa416822769777df084a54eb921f6238798..a5025e70d1694e365ddc4c8f5b87f901558a4c58)
- `BABEL_COMMIT`: [6966b6a20de59bf3442b1c6d7b9f18d442073f55...90afc691d37369e2968fd69aab7c2b3a3d871bde](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/Babel/+log/6966b6a20de59bf3442b1c6d7b9f18d442073f55..90afc691d37369e2968fd69aab7c2b3a3d871bde)
- `CLDR_COMMIT`: [514b06bc8fb4923684bac3f213bd438e16b9707c...2cbb47613782e93865169d20d5a3ae7bc3128609](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/cldr/+log/514b06bc8fb4923684bac3f213bd438e16b9707c..2cbb47613782e93865169d20d5a3ae7bc3128609)
- `CIRRUSSEARCH_COMMIT`: [732de5d27938cd77cc9f3f30236002114140b3a4...08efc46e58467c6cdd16f15040f9a0b40d558193](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/CirrusSearch/+log/732de5d27938cd77cc9f3f30236002114140b3a4..08efc46e58467c6cdd16f15040f9a0b40d558193)
- `ELASTICA_COMMIT`: [95694d841c08a33c3d931fb3788ffbeeb50a0ab3...8ee2c285217fd37690d977d9e655ddedf4c5910d](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/Elastica/+log/95694d841c08a33c3d931fb3788ffbeeb50a0ab3..8ee2c285217fd37690d977d9e655ddedf4c5910d)
- `ECHO_COMMIT`: [6bb9530ec50a696b550ee3a7319be244f2655e84...5f3d5683bc45cef8c1c92b12db1f810af7f3d8ff](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/Echo/+log/6bb9530ec50a696b550ee3a7319be244f2655e84..5f3d5683bc45cef8c1c92b12db1f810af7f3d8ff)
- `ENTITYSCHEMA_COMMIT`: [eb753e5177cfaba3be308208604bca07056756a2...abbed839ce80d809e40858fd1127cd9ce93f528e](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/EntitySchema/+log/eb753e5177cfaba3be308208604bca07056756a2..abbed839ce80d809e40858fd1127cd9ce93f528e)
- `OAUTH_COMMIT`: [8a4349c4de1d416ecf18575a6efb038a832b0615...ed73b89e60983f438ad2e638d75c6c3103bbf6c6](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/OAuth/+log/8a4349c4de1d416ecf18575a6efb038a832b0615..ed73b89e60983f438ad2e638d75c6c3103bbf6c6)
- `UNIVERSALLANGUAGESELECTOR_COMMIT`: [89e9a4002da5f90c764811230b028bccf70ef869...1ac7c58b4ac4a083b39a33c613733beafbe87700](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/UniversalLanguageSelector/+log/89e9a4002da5f90c764811230b028bccf70ef869..1ac7c58b4ac4a083b39a33c613733beafbe87700)
- `WIKIBASECIRRUSSEARCH_COMMIT`: [64f0b13cf728b8cdedfc06a19ae04772893fb3c8...b5a764f3380ca0d2b17055f55e3e745b12e4852b](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/WikibaseCirrusSearch/+log/64f0b13cf728b8cdedfc06a19ae04772893fb3c8..b5a764f3380ca0d2b17055f55e3e745b12e4852b)
- `WIKIBASEMANIFEST_COMMIT`: [c7e39e8cce0922b5d3b548c89316e1086c306527...8da5151dc999f2922ccb2f76d25ecbbf8afe1d85](https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/extensions/WikibaseManifest/+log/c7e39e8cce0922b5d3b548c89316e1086c306527..8da5151dc999f2922ccb2f76d25ecbbf8afe1d85)
- `WIKIBASELOCALMEDIA_COMMIT`: [333eb1f7cb89173161925ea4d487060d2e48a029...d1214734112b03754fc6e73651dc118f84ebf33a](https://github.com/ProfessionalWiki/WikibaseLocalMedia/compare/333eb1f7cb89173161925ea4d487060d2e48a029...d1214734112b03754fc6e73651dc118f84ebf33a)
- `WIKIBASEEDTF_COMMIT`: [40b78660f26accb5dec77c286e02c0f240673ac8...27fe77907bb16060a87e4896de0a97fefe3a97f5](https://github.com/ProfessionalWiki/WikibaseEdtf/compare/40b78660f26accb5dec77c286e02c0f240673ac8...27fe77907bb16060a87e4896de0a97fefe3a97f5)
