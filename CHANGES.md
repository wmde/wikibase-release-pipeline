# Changes

This file is only intended to serve the developers of this repository and of the releases.

This provides an overview of the releases that have been made using this release pipeline.

## January 2023: First 1.38 release

The [standard MediaWiki upgrade process](https://www.mediawiki.org/wiki/Manual:Upgrading) can be followed for this release.

- [MediaWiki release notes](https://www.mediawiki.org/wiki/Release_notes/1.38)
- [Wikibase release notes](https://github.com/wikimedia/Wikibase/blob/REL1_38/RELEASE-NOTES-1.38)

| Suite Version | Version Info | Date availbile | Run number | Release task  |
|---------------|----------------------|----------------|------------| --------------|
| wmde.10 ([spec](https://github.com/wmde/wikibase-release-pipeline/blob/wmde.10/versions/wmde10.env),[metadata](https://github.com/wmde/wikibase-release-pipeline/blob/main/versions/wmde10)) | MediaWiki (1.38.5, PHP 8.0.26), WDQS (0.3.118)    | [16 January 2023](https://lists.wikimedia.org/hyperkitty/list/wikibaseug@lists.wikimedia.org/thread/KFPAI4S3S24IPAXTSF3AKYGSFUOKTM34/) | [3925740668](https://github.com/wmde/wikibase-release-pipeline/actions/runs/3925740668) | [T322407](https://phabricator.wikimedia.org/T322407) |

## November 2022: First 1.37 release

The [standard MediaWiki upgrade process](https://www.mediawiki.org/wiki/Manual:Upgrading) can be followed for this release.

- [MediaWiki release notes](https://www.mediawiki.org/wiki/Release_notes/1.37)
- [Wikibase release notes](https://github.com/wikimedia/Wikibase/blob/REL1_37/RELEASE-NOTES-1.37)

The Query service was also updated from `0.3.97` to `0.3.115`, but no additional upgrade process is needed.

| Suite Version | Version Info | Date availbile | Run number | Release task  |
|---------------|----------------------|----------------|------------| --------------|
| wmde.9 ([spec](https://github.com/wmde/wikibase-release-pipeline/blob/wmde.9/versions/wmde9.env),[metadata](https://github.com/wmde/wikibase-release-pipeline/blob/main/versions/wmde9)) | MediaWiki (1.37.6, PHP 7.4.30), WDQS (0.3.115)    | [1 November 2022](https://lists.wikimedia.org/hyperkitty/list/wikibaseug@lists.wikimedia.org/thread/RWS6EV7SHFNOD6KKQ6JA7RUW4TEXSXN5/) | [3303724221](https://github.com/wmde/wikibase-release-pipeline/actions/runs/3303724221) | [T317890](https://phabricator.wikimedia.org/T317890) |

## September 2022: Security releases

| Suite Version | MediaWiki release | Date availbile | Run number | Release task  |
|---------------|----------------------|----------------|------------| --------------|
| wmde.8 ([spec](https://github.com/wmde/wikibase-release-pipeline/blob/wmde.8/versions/wmde8.env),[metadata](https://github.com/wmde/wikibase-release-pipeline/blob/ec8b9e0bb25b9524df5671ad7785a66683598920/versions/wmde8)) | 1.36.4    | September 2022 | [2971822356](https://github.com/wmde/wikibase-release-pipeline/actions/runs/2971822356) | [T316707](https://phabricator.wikimedia.org/T316707) |
| wmde.7 ([spec](https://github.com/wmde/wikibase-release-pipeline/blob/wmde.7/versions/wmde7.env),[metadata](https://github.com/wmde/wikibase-release-pipeline/blob/ec8b9e0bb25b9524df5671ad7785a66683598920/versions/wmde7)) | 1.35.7    | September 2022 | [2971057584](https://github.com/wmde/wikibase-release-pipeline/actions/runs/2971057584) | [T314881](https://phabricator.wikimedia.org/T314881) |

Releases that bring a handfull of small security fixes to MediaWiki & Wikibase, along with small patches to other components.

## February 2022: Security releases

| Suite Version | Compatable MediaWiki | Date availbile | Run number | Release task |
|---------------|----------------------|----------------|------------| --------------|
| wmde.5 ([spec](https://github.com/wmde/wikibase-release-pipeline/blob/wmde.5/versions/wmde5.env)) | 1.36    | 10 February 2022 | [1824280943](https://github.com/wmde/wikibase-release-pipeline/actions/runs/1824280943) | [T301359](https://phabricator.wikimedia.org/T301359) |
| wmde.6 ([spec](https://github.com/wmde/wikibase-release-pipeline/blob/wmde.6/versions/wmde6.env)) | 1.35    | 22 February 2022 | [1853048237](https://github.com/wmde/wikibase-release-pipeline/actions/runs/1853048237) | [T301663](https://phabricator.wikimedia.org/T301663) |

### Security related changes

- Elastic search version changed from 6.5.4 to 6.8.23 ([release notes](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/es-release-notes.html)) due to [security issues](https://phabricator.wikimedia.org/T297002) in the 6.5.4 base docker image.
- Query service UI updated, including fixes to 3 security issues
  - [Wikidata Query UI lets users build links with arbitrary link text and javascript: URL](https://phabricator.wikimedia.org/T297686)
  - [XSS in WDQS query helper](https://phabricator.wikimedia.org/T298839)
  - [XSS in WDQS UI result view explore button](https://phabricator.wikimedia.org/T298871)

## January 2022: First 1.36 release

The [standard MediaWiki upgrade process](https://www.mediawiki.org/wiki/Manual:Upgrading) can be followed for this release.

- [MediaWiki release notes](https://www.mediawiki.org/wiki/Release_notes/1.36)
- [Wikibase release notes](https://github.com/wikimedia/Wikibase/blob/REL1_36/RELEASE-NOTES-1.36)

The Query service was also updated from `0.3.40` to `0.3.97`, but no additional upgrade process is needed.

| Suite Version | Compatible MediaWiki | Date available | Release board |
|---------------|----------------------|----------------| --------------|
| wmde.4 ([spec](https://github.com/wmde/wikibase-release-pipeline/blob/wmde.4/versions/wmde4.env)) | 1.36    | 5 January 2022 | [Board](https://phabricator.wikimedia.org/project/board/5645/query/all/) |

## December 2021: 1.35 Security release

Fix for CVE-2021-44228 [Log4Shell](https://en.wikipedia.org/wiki/Log4Shell) issue in ElasticSearch image.

Included a MediaWiki update to 1.35.5

| Suite Version | Compatible MediaWiki | Date available | Release board |
|---------------|----------------------|----------------|--------------|
| wmde.3 ([spec](https://github.com/wmde/wikibase-release-pipeline/blob/wmde.3/versions/wmde3.env)) | 1.35    | 16 December 2021 | [Board](https://phabricator.wikimedia.org/project/board/5645/query/all/) |

## November 2021: 1.35 Security release

Primarily for a MediaWiki update to 1.35.4
(other components were also updated)

| Suite Version | Compatible MediaWiki | Date available | Release board |
|---------------|----------------------|----------------|--------------|
| wmde.2 ([spec](https://github.com/wmde/wikibase-release-pipeline/blob/wmde.2/versions/wmde2.env)) | 1.35    | 30 November 2021 | [Board](https://phabricator.wikimedia.org/project/board/5622/query/all/) |

## May 2021: 1.35 Security release

Primarily for a MediaWiki update to 1.35.2
(other components were also updated)

| Suite Version | Compatible MediaWiki | Date available | Release board |
|---------------|----------------------|----------------|--------------|
| wmde.1 ([spec](https://github.com/wmde/wikibase-release-pipeline/blob/wmde.1/versions/wmde1.env)) | 1.35    | 6 May 2021 | ??? |

## February 2021: First 1.35 release

An inital suite release using MediaWiki 1.35.0

| Suite Version | Compatible MediaWiki | Date available | Release board |
|---------------|----------------------|----------------|--------------|
| wmde.0 ([spec](https://github.com/wmde/wikibase-release-pipeline/blob/wmde.1/versions/wmde0.env)) | 1.35    | 19 February 2021 | ??? |
