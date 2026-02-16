# 6.0.0 (2026-02-16)

Upgrades to MediaWiki from 1.44 to 1.45 including updates to compatible packaged extensions

- MediaWiki updated from 1.44.0 to 1.45.0 (see https://www.mediawiki.org/wiki/MediaWiki_1.45 and https://github.com/wikimedia/mediawiki/compare/1.44.0...1.45.0)
- Bundled extension pins updated from REL1_44 to REL1_45-compatible commits in build/wikibase/build.env.
- OAuth same-domain patch updated for MW 1.45 compatibility in build/wikibase/mediawiki-extensions-OAuth-same-domain.patch.
- "repo" suite E2E specs were stabilized for MW 1.45, and an OAuth consumer creation smoke test was added.

Analysis revealed breaking changes expected for a MediaWiki major-version upgrade.

# 5.0.0 (2025-07-24)


### 💅 Refactors

- ⚠️  move callback to wikibase image


### 📦 Build

- depth 1 checkouts in wikibase-image build


### 🏡 Chore

- ⚠️  bump mediawiki to 1.44.0


#### ⚠️  Breaking Changes

- ⚠️  move callback to wikibase image
- ⚠️  bump mediawiki to 1.44.0

## 4.1.1 (2025-07-17)


### 🏡 Chore

- bump mediawiki to 1.43.3, update extensions

## 4.1.0 (2025-06-13)


### 🚀 Features

- Add operating system dependencies for Mediawiki extensions

## 4.0.1 (2025-04-29)


### 🏡 Chore

- mediawiki 1.43.1

# 4.0.0 (2025-03-20)

### 🩹 Fixes

- OAuth consumers (e.g. QuickStatements) on same domain

### 📖 Documentation

- Prepare Deploy 4 release
- Update Dockerhub readme

### 🏡 Chore

-  ⚠️ Bump MediaWiki to 1.43

#### ⚠️ Breaking Changes

-  ⚠️ Bump MediaWiki to 1.43

## 3.0.3 (2025-02-24)

### 🏡 Chore

- bump mediawiki to 1.42.4

- bump mediawiki extensions

- bump php to 8.3.16

- bump to mediawiki 1.42.5

## 3.0.2 (2024-10-28)

### 🏡 Chore

- bump mediawiki to 1.42.3, bump extensions

## 3.0.1 (2024-10-09)

### 📖 Documentation

- Link to MediaWiki bundled extensions
- Switch from `.example.com` to `.example`

### 🏡 Chore

- Removes re-installation of extensions already packaged with MediaWiki (ConfirmEdit, Nuke, Scribunto, SyntaxHighlight_Geshi, VisualEditor)
- Updates Wikibase EDTF extension
