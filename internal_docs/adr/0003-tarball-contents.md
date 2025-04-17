# 3) Tarball contents {#adr_0003}

Date: 2020-11-23

## Status

proposed

## Context

The release pipeline of Wikibase will produce a tarball release package containing a tested version of the Wikibase extension. The package will normally include the necessary files to run the software and sometimes documentation of changes to the software and how to use them.

In order to get a overview on the practices by the open-source php community a brief survey was done on the releases of some popular projects.

| Name | Release notes | Historic release notes | Installation instructions | Upgrade instructions | Hidden files | Vendor folder |
| --- | --- | --- | --- | --- | --- | --- |
| mediawiki | yes | yes | yes | yes | no | yes (9) |
| laravel | no (1) | no | no | no | some (6) | no |
| nextcloud | no (2) | no | no | no | some (7) | yes |
| joomla | no (3) | no (3) | yes (3) | no (4) | no | yes |
| wordpress | no (5) | no | yes (8) | no | no | - |

---

1. Online https://laravel.com/docs/5.8/releases
2. Online https://nextcloud.com/changelog/
3. Installation/INSTALL & simple readme with links to https://docs.joomla.org/Special:MyLanguage/Joomla_3.9_version_history, https://downloads.joomla.org/technical-requirements
4. Specific upgrade release packages
5. Online https://wordpress.org/news/2020/11/wordpress-5-6-beta-4/
6. gitignore, editorconfig etc.
7. Necessary htaccess files
8. Readme.html with installation & upgrade instructions and links to documentation for further reading.
9. https://releases.wikimedia.org/mediawiki/1.35/mediawiki-1.35.0.tar.gz

---

MediaWiki sticks out from the crowd by including most of their release specific documentation in each of the tarball releases while all other projects in the survey do not. At first glance this feels like a undesirable pattern to adopt as it's uncommon among other projects. In reality this points out a tested and proven methodology for documenting changes and shipping release notes by the mediawiki community. Release notes are added to the release branch and refined throughout the release process and then used as a template for the documentation on mediawiki.org.

The `vendor` folder comes populated in some of the release packages for the different projects and this is also the behavior of [Extension Distributor]. The reasons given for this behavior dates back to a [request from 2014] to include the composer dependencies in tarballs as composer could for various reasons not be available on the system the software was supposed to be installed on.

## Decision

Seeing that there is an already defined process for release notes by the mediawiki community it feels natural to use existing tools and adopting this process.

The `vendor` folder will be included in the tarball as this aligns with the mediawiki tarballs and the behavior of [Extension Distributor].

The tarball package _WILL_ include apart from the source-code the following additions.

- `vendor` folder populated by composer
- Release notes (RELEASE-NOTES-N.NN) (example RELEASE-NOTES-1.36)
- Historic changes (HISTORY) (Previous release notes in one file)
- git submodules

The tarball will _NOT_ include.

- `node_modules`
- `build` folder
- hidden files/folders in the root folder
  - `.gitignore`
  - `.gitreview`
  - `.git` folder
  - `.github` folder
  - `.vscode` folder
  - `.phan` folder
  - etc.

## Consequences

- Include release notes in the tarball.
- Include vendor folder populated by composer
- Remove any files that are not critical to the functionality of the software.
- The installation instructions for Wikibase will need to be updated in order to describe a use-case where the `vendor` folder is already existing.

[request from 2014]: https://lists.wikimedia.org/pipermail/wikitech-l/2014-July/077888.html
[Extension Distributor]: https://www.mediawiki.org/wiki/Extension:ExtensionDistributor
