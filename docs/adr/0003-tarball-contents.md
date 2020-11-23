# 3) Tarball contents {#adr_0003}

Date: 2020-11-23

## Status

proposed

## Context

The release pipeline of Wikibase will produce a tarball release package containing a tested version of the Wikibase extension.
The package will normally include the necessary files to run the software and sometimes documentation of changes to the software and how to use them.

In order to get a overview on the practices by the open-source php community a brief survey was done on the releases of some popular projects.


| Name      | Release notes  |   Historic release notes    | Installation instructions  | Upgrade instructions | Hidden files  | Vendor folder |
| --------- | ---------------| --------------------------- | -------------------------- | ---------------------| --------------|---------------|
| mediawiki |      yes       |            yes              |            yes             |          yes         |      no       |       no
| laravel   |      no (1)    |            no               |            no              |          no          |      some (6) |       no
| nextcloud |      no (2)    |            no               |            no              |          no          |      some (7) |       yes
| joomla    |      no (3)    |            no (3)           |            yes (3)         |          no (4)      |      no       |       yes
| wordpress |      no (5)    |            no               |            yes (8)         |          no          |      no       |       -

---

1. Online https://laravel.com/docs/5.8/releases
2. Online https://nextcloud.com/changelog/
3. Installation/INSTALL & simple readme with links to https://docs.joomla.org/Special:MyLanguage/Joomla_3.9_version_history, https://downloads.joomla.org/technical-requirements
4. Specific upgrade release packages
5. Online https://wordpress.org/news/2020/11/wordpress-5-6-beta-4/
6. gitignore, editorconfig etc.
7. Necessary htaccess files
8. Readme.html with installation & upgrade instructions and links to documentation for further reading.

---

Mediawiki sticks out from the crowd by including most of their release specific documentation in each of the tarball releases while all other projects in the survey do not.
Release specific documentation seems to generally be maintained on a separate website or file that comes along side the release package.
## Decision

Seeing that release notes are generally kept separate from the actual release tarball we've decided to follow this pattern and keep release notes in a central place that allows for easy access and updates. This does not mean release notes based on the git history will not be generated automatically in the release pipeline.

The `vendor` folder will not be included in the tarball as composer dependencies should be merged by the [composer merge plugin](https://github.com/wikimedia/composer-merge-plugin).  

The tarball package *WILL* include a part from the source-code the following additions.

- git submodule dependencies

The tarball will *NOT* include.

- Release notes (RELEASE-NOTES-N.NN) (example RELEASE-NOTES-1.36)
- Historic changes (HISTORY) (Previous release notes in one file)
- `vendor` folder populated by composer
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

- Do not include release notes in the tarball. 
- Do not include vendor folder
- Remove any files that are not critical to the functionality of the software.

...
